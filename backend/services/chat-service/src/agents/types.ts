import type { Message } from '@prisma/client';

export interface LLMClient {
  model: string;
  client: import('@anthropic-ai/sdk').default;
}

export interface AgentInput {
  message: string;
  conversationHistory: Pick<Message, 'role' | 'content'>[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  currentTopic?: string;
  courseId?: string;
  userId: string;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  metadata: {
    text: string;
    source: string;
    documentTitle: string;
    section: string;
    url?: string;
    difficulty?: string;
    courseId?: string;
  };
}

export interface Citation {
  source: string;
  documentTitle: string;
  section: string;
  url?: string;
  relevanceScore: number;
}

export interface QuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

export type SSEEventType =
  | 'agent_status'
  | 'guardrail_blocked'
  | 'token'
  | 'citation'
  | 'quiz'
  | 'done'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  [key: string]: unknown;
}

export interface AgentContext {
  intent?: string;
  confidence?: number;
  guardrailPassed?: boolean;
  guardrailReason?: string;
  retrievedChunks?: RetrievedChunk[];
  citations?: Citation[];
  responseContent?: string;
  quiz?: QuizPayload;
  suggestedTopics?: string[];
  agentTimings?: Record<string, number>;
}

export interface Agent {
  name: string;
  execute(input: AgentInput, context: AgentContext): Promise<AgentContext>;
}

export interface StreamingAgent extends Agent {
  executeStream(input: AgentInput, context: AgentContext): AsyncGenerator<SSEEvent>;
}
