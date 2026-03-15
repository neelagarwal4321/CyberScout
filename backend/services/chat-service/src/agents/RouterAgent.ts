import type { Agent, AgentInput, AgentContext, LLMClient } from './types';

const ROUTER_SYSTEM_PROMPT = `You are an intent classifier for a cybersecurity learning chatbot. Classify the user's message into exactly one intent.

Intents:
- concept_question: asking about a cybersecurity concept, technique, or term
- troubleshooting: asking for help solving a specific technical problem
- quiz_request: asking to be tested or quizzed
- code_example_request: asking to see code or configuration examples
- progress_check: asking about their own progress, level, or what to study next
- off_topic: not related to cybersecurity or learning
- greeting: hello, thanks, goodbye, or casual conversation

Respond ONLY with JSON:
{"intent": "concept_question", "confidence": 0.95, "suggestedTopic": "sql-injection"}

Never include explanations. Only JSON.`;

export class RouterAgent implements Agent {
  name = 'router';

  constructor(private llm: LLMClient) {}

  async execute(input: AgentInput, context: AgentContext): Promise<AgentContext> {
    const recentHistory = input.conversationHistory
      .slice(-5)
      .map((m) => `${m.role}: ${m.content.substring(0, 200)}`)
      .join('\n');

    const response = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 100,
      temperature: 0,
      system: ROUTER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Recent conversation:\n${recentHistory}\n\nNew message: "${input.message}"\nUser level: ${input.userLevel}\n\nClassify this message.`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    let parsed: { intent?: string; confidence?: number; suggestedTopic?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { intent: 'concept_question', confidence: 0.5 };
    }

    return {
      ...context,
      intent: parsed.intent ?? 'concept_question',
      confidence: parsed.confidence ?? 0.5,
    };
  }
}
