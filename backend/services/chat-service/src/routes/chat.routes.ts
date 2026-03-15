import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@cyberscout/db-client';
import { AppError } from '@cyberscout/error-handler';
import { requireAuth } from '@cyberscout/auth-middleware';
import type { RedisClient } from '@cyberscout/redis-client';
import type { AgentOrchestrator } from '../agents/AgentOrchestrator';
import type { AgentInput, Citation, QuizPayload } from '../agents/types';
import type { Logger } from 'pino';

// ── Validation schemas ────────────────────────────────────────────────────────
const MessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  context: z
    .object({
      currentTopic: z.string().optional(),
      courseId: z.string().optional(),
    })
    .optional(),
});

const QuizAnswerSchema = z.object({
  topic: z.string(),
  correct: z.boolean(),
});

// ── Rate limit helpers ────────────────────────────────────────────────────────
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  free: { limit: 30, window: 3600 },
  pro: { limit: 200, window: 3600 },
  max: { limit: 1000, window: 3600 },
};

const MAX_CONCURRENT: Record<string, number> = { free: 1, pro: 2, max: 3 };

async function checkRateLimit(redis: RedisClient, userId: string, tier: string): Promise<boolean> {
  const config = RATE_LIMITS[tier] ?? RATE_LIMITS['free'];
  const key = `ratelimit:chat:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, config.window);
  return count <= config.limit;
}

async function incrementConcurrent(redis: RedisClient, userId: string): Promise<number> {
  const key = `concurrent:${userId}`;
  const val = await redis.incr(key);
  await redis.expire(key, 60);
  return val;
}

async function decrementConcurrent(redis: RedisClient, userId: string): Promise<void> {
  const key = `concurrent:${userId}`;
  const val = await redis.decr(key);
  if (val <= 0) await redis.del(key);
}

// ── Context window builder ────────────────────────────────────────────────────
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function buildContextWindow(
  conversationId: string,
  maxTokens = 4096,
): Promise<Array<{ role: string; content: string }>> {
  const allMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  let tokenCount = 0;
  const included: Array<{ role: string; content: string }> = [];

  for (const msg of allMessages) {
    const msgTokens = estimateTokens(msg.content);
    if (tokenCount + msgTokens > maxTokens) break;
    included.unshift({ role: msg.role, content: msg.content });
    tokenCount += msgTokens;
  }

  return included;
}

// ── Router factory ────────────────────────────────────────────────────────────
export function chatRoutes(
  orchestrator: AgentOrchestrator,
  redis: RedisClient,
  logger: Logger,
): Router {
  const router = Router();

  // ── GET /chat/conversations ─────────────────────────────────────────────
  router.get(
    '/conversations',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const conversations = await prisma.conversation.findMany({
          where: { userId, deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: 50,
          select: {
            id: true,
            title: true,
            topic: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { messages: true } },
          },
        });
        res.json({ data: conversations });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /chat/conversations ────────────────────────────────────────────
  router.post(
    '/conversations',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const conversation = await prisma.conversation.create({
          data: { userId, title: 'New conversation' },
        });
        res.status(201).json({ data: conversation });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── GET /chat/conversations/:id/messages ────────────────────────────────
  router.get(
    '/conversations/:id/messages',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const conversation = await prisma.conversation.findFirst({
          where: { id: req.params['id'], userId, deletedAt: null },
        });
        if (!conversation) throw new AppError('CONVERSATION_NOT_FOUND', 404);

        const messages = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'asc' },
        });
        res.json({ data: messages });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── DELETE /chat/conversations/:id ──────────────────────────────────────
  router.delete(
    '/conversations/:id',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const updated = await prisma.conversation.updateMany({
          where: { id: req.params['id'], userId },
          data: { deletedAt: new Date() },
        });
        if (updated.count === 0) throw new AppError('CONVERSATION_NOT_FOUND', 404);
        res.json({ data: { success: true } });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /chat/message  (SSE streaming endpoint) ────────────────────────
  router.post(
    '/message',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.sub;
      const tier = req.user!.tier ?? 'free';

      // Rate limit
      const allowed = await checkRateLimit(redis, userId, tier);
      if (!allowed) {
        next(new AppError('CHAT_RATE_LIMITED', 429));
        return;
      }

      // Concurrent stream limit
      const concurrent = await incrementConcurrent(redis, userId);
      if (concurrent > (MAX_CONCURRENT[tier] ?? 1)) {
        await decrementConcurrent(redis, userId);
        next(new AppError('CHAT_RATE_LIMITED', 429, { reason: 'concurrent_limit' }));
        return;
      }

      // Validate body
      let body: z.infer<typeof MessageSchema>;
      try {
        body = MessageSchema.parse(req.body);
      } catch (err) {
        await decrementConcurrent(redis, userId);
        next(err);
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Get or create conversation
      let conversation = body.conversationId
        ? await prisma.conversation.findFirst({
            where: { id: body.conversationId, userId, deletedAt: null },
          })
        : null;

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId,
            title: body.message.substring(0, 60),
            topic: body.context?.currentTopic,
          },
        });
      }

      // Build context window
      const history = await buildContextWindow(conversation.id);

      const agentInput: AgentInput = {
        message: body.message,
        conversationHistory: history as Array<{ role: string; content: string }> as any,
        userLevel: (req.user!.level as 'beginner' | 'intermediate' | 'advanced') ?? 'beginner',
        currentTopic: body.context?.currentTopic ?? conversation.topic ?? undefined,
        courseId: body.context?.courseId,
        userId,
      };

      // Persist user message
      await prisma.message.create({
        data: { conversationId: conversation.id, role: 'user', content: body.message },
      });

      // Stream agent pipeline
      let fullResponse = '';
      const citations: Citation[] = [];
      let quiz: QuizPayload | undefined;
      let suggestedTopics: string[] = [];

      try {
        for await (const event of orchestrator.execute(agentInput)) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);

          if (event.type === 'token') fullResponse += event['content'] as string;
          if (event.type === 'citation') citations.push(event['data'] as Citation);
          if (event.type === 'quiz') quiz = event['data'] as QuizPayload;
          if (event.type === 'done') suggestedTopics = (event['suggestedTopics'] as string[]) ?? [];
        }

        // Persist assistant message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: fullResponse,
            metadata: JSON.parse(JSON.stringify({ citations, quiz, suggestedTopics })),
          },
        });

        // Update conversation metadata
        if (agentInput.currentTopic) {
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { topic: agentInput.currentTopic, updatedAt: new Date() },
          });
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err) {
        logger.error({ err, conversationId: conversation.id }, 'Stream error');
        const errEvent = { type: 'error', code: 'CHAT_STREAM_ERROR', message: 'Stream interrupted' };
        res.write(`data: ${JSON.stringify(errEvent)}\n\n`);
        res.end();
      } finally {
        await decrementConcurrent(redis, userId);
      }
    },
  );

  // ── POST /chat/quiz/answer ──────────────────────────────────────────────
  router.post(
    '/quiz/answer',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const { topic, correct } = QuizAnswerSchema.parse(req.body);

        // Elo-inspired mastery update
        const current = await prisma.topicMastery.findUnique({
          where: { userId_topic: { userId, topic } },
        });

        const currentScore = current?.masteryScore ?? 0;
        const difficulty = mapMasteryToDifficulty(currentScore);
        const kFactor: Record<string, { gain: number; loss: number }> = {
          recall: { gain: 3, loss: 5 },
          understanding: { gain: 5, loss: 4 },
          application: { gain: 7, loss: 3 },
          analysis: { gain: 10, loss: 2 },
        };
        const k = kFactor[difficulty]!;
        const delta = correct ? k.gain : -k.loss;
        const newScore = Math.max(0, Math.min(100, currentScore + delta));

        const mastery = await prisma.topicMastery.upsert({
          where: { userId_topic: { userId, topic } },
          create: {
            userId,
            topic,
            masteryScore: newScore,
            quizzesTaken: 1,
            quizzesPassed: correct ? 1 : 0,
            lastAssessed: new Date(),
          },
          update: {
            masteryScore: newScore,
            quizzesTaken: { increment: 1 },
            quizzesPassed: correct ? { increment: 1 } : undefined,
            lastAssessed: new Date(),
          },
        });

        res.json({ data: { masteryScore: mastery.masteryScore, delta, correct } });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

function mapMasteryToDifficulty(score: number): string {
  if (score < 30) return 'recall';
  if (score < 60) return 'understanding';
  if (score < 80) return 'application';
  return 'analysis';
}
