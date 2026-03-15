import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger } from '@cyberscout/logger';
import { prisma } from '@cyberscout/db-client';
import { createRedisClient, createPubSub } from '@cyberscout/redis-client';
import { errorHandler } from '@cyberscout/error-handler';
import { AgentOrchestrator } from './agents/AgentOrchestrator';
import { VectorStore, EmbeddingService } from './agents/RetrievalAgent';
import { chatRoutes } from './routes/chat.routes';

const logger = createLogger('chat-service');
const PORT = parseInt(process.env['PORT'] ?? '3003', 10);

async function main() {
  const redis = createRedisClient();
  const pubsub = createPubSub();

  // Initialize optional Pinecone + embedding services
  const vectorStore = process.env['PINECONE_API_KEY']
    ? new VectorStore(process.env['PINECONE_API_KEY'])
    : null;
  const embedder = process.env['ANTHROPIC_API_KEY']
    ? new EmbeddingService(process.env['ANTHROPIC_API_KEY'])
    : null;

  const orchestrator = new AgentOrchestrator({
    anthropicApiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
    vectorStore,
    embedder,
    logger,
  });

  // Listen for lecture completions to bump topic mastery
  await pubsub.subscribe('events:lecture.completed', async (event: any) => {
    if (event.topic && event.userId) {
      await prisma.topicMastery.upsert({
        where: { userId_topic: { userId: event.userId, topic: event.topic } },
        create: { userId: event.userId, topic: event.topic, masteryScore: 5, quizzesTaken: 0, quizzesPassed: 0, lastAssessed: new Date() },
        update: { masteryScore: { increment: 3 }, lastAssessed: new Date() },
      });
    }
  });

  // Soft-delete conversations when a user account is deleted
  await pubsub.subscribe('events:user.deleted', async (event: any) => {
    if (event.userId) {
      await prisma.conversation.updateMany({
        where: { userId: event.userId },
        data: { deletedAt: new Date() },
      });
    }
  });

  const app = express();
  app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '500kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'chat-service', uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.use('/chat', chatRoutes(orchestrator, redis, logger));
  app.use(errorHandler as express.ErrorRequestHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Chat service started');
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await prisma.$disconnect();
    await pubsub.quit();
    await redis.quit();
    logger.info('Chat service shut down');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
