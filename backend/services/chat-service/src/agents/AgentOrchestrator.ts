import Anthropic from '@anthropic-ai/sdk';
import { RouterAgent } from './RouterAgent';
import { GuardrailAgent } from './GuardrailAgent';
import { RetrievalAgent, VectorStore, EmbeddingService } from './RetrievalAgent';
import { TeachingAgent } from './TeachingAgent';
import { AssessmentAgent } from './AssessmentAgent';
import type { AgentInput, AgentContext, SSEEvent, LLMClient } from './types';
import type { Logger } from 'pino';

interface OrchestratorDeps {
  anthropicApiKey: string;
  vectorStore: VectorStore | null;
  embedder: EmbeddingService | null;
  logger: Logger;
}

const DEFAULT_TOPICS: Record<string, string[]> = {
  beginner: ['What is the CIA triad?', 'How do firewalls work?', 'Types of malware'],
  intermediate: ['OWASP Top 10 overview', 'Incident response steps', 'Network traffic analysis'],
  advanced: ['Advanced persistent threats', 'Reverse engineering basics', 'Zero-day exploit lifecycle'],
};

const GUARDRAIL_MESSAGES: Record<string, string> = {
  off_topic:
    "I'm focused on cybersecurity topics. I'd be happy to help with questions about networking, security concepts, vulnerabilities, or defense strategies. What would you like to explore?",
  exploit_code:
    "I can explain how vulnerabilities work conceptually and how to defend against them, but I can't provide working exploit code. Would you like me to explain the defense strategies instead?",
  pii_request:
    "I can't help with accessing personal information. Let me know if you have a cybersecurity concept you'd like to explore.",
  jailbreak: "Let's stay focused on learning cybersecurity. What topic are you working on?",
  harmful:
    "That request falls outside what I can help with on a cybersecurity learning platform. Ask me anything about defensive security, tools, or concepts.",
};

export class AgentOrchestrator {
  private router: RouterAgent;
  private guardrail: GuardrailAgent;
  private retrieval: RetrievalAgent;
  private teaching: TeachingAgent;
  private assessment: AssessmentAgent;
  private logger: Logger;

  constructor(deps: OrchestratorDeps) {
    const anthropic = new Anthropic({ apiKey: deps.anthropicApiKey });
    const haikuClient: LLMClient = { model: 'claude-haiku-4-5-20251001', client: anthropic };
    const sonnetClient: LLMClient = { model: 'claude-sonnet-4-6', client: anthropic };

    this.router = new RouterAgent(haikuClient);
    this.guardrail = new GuardrailAgent(haikuClient);
    this.retrieval = new RetrievalAgent(deps.vectorStore, deps.embedder, haikuClient);
    this.teaching = new TeachingAgent(sonnetClient);
    this.assessment = new AssessmentAgent(haikuClient);
    this.logger = deps.logger;
  }

  async *execute(input: AgentInput): AsyncGenerator<SSEEvent> {
    const timings: Record<string, number> = {};
    let context: AgentContext = { agentTimings: timings };

    // ── STAGE 1: ROUTE ─────────────────────────────────────────────────────
    const routeStart = Date.now();
    try {
      context = await this.router.execute(input, context);
      timings['router'] = Date.now() - routeStart;
      yield {
        type: 'agent_status',
        agent: 'router',
        status: 'complete',
        data: { intent: context.intent, confidence: context.confidence },
      };
    } catch (err) {
      this.logger.error({ err, agent: 'router' }, 'Router agent failed');
      context.intent = 'concept_question';
      context.confidence = 0.5;
    }

    // ── STAGE 2: GUARDRAIL ────────────────────────────────────────────────
    const guardStart = Date.now();
    try {
      context = await this.guardrail.execute(input, context);
      timings['guardrail'] = Date.now() - guardStart;

      if (!context.guardrailPassed) {
        yield { type: 'guardrail_blocked', reason: context.guardrailReason };
        const msg = GUARDRAIL_MESSAGES[context.guardrailReason!] ?? GUARDRAIL_MESSAGES['off_topic'];
        yield { type: 'token', content: msg };
        yield { type: 'done', suggestedTopics: DEFAULT_TOPICS[input.userLevel] ?? DEFAULT_TOPICS['beginner'] };
        return;
      }
    } catch (err) {
      this.logger.error({ err, agent: 'guardrail' }, 'Guardrail agent failed — blocking as a precaution');
      yield {
        type: 'token',
        content: "I'm having trouble processing that right now. Could you rephrase your question about cybersecurity?",
      };
      yield { type: 'done', suggestedTopics: [] };
      return;
    }

    // ── STAGE 3: RETRIEVE ─────────────────────────────────────────────────
    const retrieveStart = Date.now();
    try {
      context = await this.retrieval.execute(input, context);
      timings['retrieval'] = Date.now() - retrieveStart;
      yield {
        type: 'agent_status',
        agent: 'retrieval',
        status: 'complete',
        data: { chunksFound: context.retrievedChunks?.length ?? 0 },
      };
    } catch (err) {
      this.logger.warn({ err, agent: 'retrieval' }, 'Retrieval failed — continuing without context');
      context.retrievedChunks = [];
      context.citations = [];
    }

    // ── STAGE 4: TEACH (STREAMING) ────────────────────────────────────────
    const teachStart = Date.now();
    try {
      const stream = this.teaching.executeStream(input, context);
      for await (const event of stream) {
        yield event;
      }
      timings['teaching'] = Date.now() - teachStart;

      // Emit citations after stream completes
      if (context.citations && context.citations.length > 0) {
        for (const citation of context.citations) {
          yield { type: 'citation', data: citation };
        }
      }
    } catch (err) {
      this.logger.error({ err, agent: 'teaching' }, 'Teaching agent stream failed');
      yield { type: 'token', content: 'I encountered an issue generating a response. Please try again.' };
    }

    // ── STAGE 5: ASSESS (OPTIONAL) ────────────────────────────────────────
    if (this.shouldTriggerAssessment(input, context)) {
      const assessStart = Date.now();
      try {
        context = await this.assessment.execute(input, context);
        timings['assessment'] = Date.now() - assessStart;
        if (context.quiz) {
          yield { type: 'quiz', data: context.quiz };
        }
      } catch (err) {
        this.logger.warn({ err, agent: 'assessment' }, 'Assessment agent failed — skipping quiz');
      }
    }

    // ── FINALIZE ──────────────────────────────────────────────────────────
    yield {
      type: 'done',
      suggestedTopics: context.suggestedTopics ?? [],
      timings,
    };
  }

  private shouldTriggerAssessment(input: AgentInput, context: AgentContext): boolean {
    if (context.intent === 'quiz_request') return true;
    if (input.conversationHistory.length > 0 && input.conversationHistory.length % 5 === 0)
      return true;
    const quizKeywords = ['quiz me', 'test me', 'check my', 'assess my'];
    if (quizKeywords.some((kw) => input.message.toLowerCase().includes(kw))) return true;
    return false;
  }
}
