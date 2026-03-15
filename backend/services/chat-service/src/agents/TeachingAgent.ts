import type { StreamingAgent, AgentInput, AgentContext, LLMClient, SSEEvent } from './types';

const TEACHING_BASE_PROMPT = `You are CyberScout AI, an expert cybersecurity tutor. You teach with precision, clarity, and genuine care for the student's growth.

CORE PRINCIPLES:
1. Use the Socratic method — ask guiding questions to help the student think, don't just dump information
2. Provide concrete code or command examples when discussing tools and techniques
3. Always explain "why" something is important, not just "what" it is
4. Reference the provided source material using [Source N] markers when available
5. Suggest 2-3 related topics the student might want to explore next
6. If a concept has a corresponding lab or exercise in the curriculum, mention it
7. Stay strictly within the cybersecurity domain

FORMATTING:
- Use markdown: ## for section headers, **bold** for key terms, \`\`\` for code blocks
- Keep responses under 1500 tokens
- Structure: brief answer → detailed explanation → example → follow-up question

SAFETY:
- Explain how attacks work conceptually
- Always pair attack explanations with defense strategies
- Never provide working exploits or payloads for real-world use
- For tools like Metasploit, explain in lab/CTF context only`;

const LEVEL_ADAPTATIONS: Record<string, string> = {
  beginner: `BEGINNER STUDENT NOTES:
- Use simple analogies (compare firewalls to building security guards)
- Avoid jargon — when you must use technical terms, define them immediately
- More examples, fewer abstractions
- Assume no prior programming experience
- Encourage frequently — learning security can feel overwhelming`,
  intermediate: `INTERMEDIATE STUDENT NOTES:
- Use technical terminology freely
- Include real-world scenarios and case studies
- Reference specific tools and their usage
- Discuss trade-offs and design decisions
- Provide command-line examples`,
  advanced: `ADVANCED STUDENT NOTES:
- Discuss internals and implementation details
- Reference research papers and RFCs
- Cover edge cases and advanced attack variants
- Discuss zero-day dynamics and advanced persistent threats
- Engage with nuance — security is rarely black and white`,
};

const TOPIC_EXTRACTION_PROMPT = `Given this AI cybersecurity tutor response, extract 2-3 specific follow-up topics the student should explore next.
Return ONLY a JSON array of short topic strings, e.g. ["SQL injection prevention", "Prepared statements", "WAF configuration"].
Never include explanations.`;

export class TeachingAgent implements StreamingAgent {
  name = 'teaching';

  constructor(private llm: LLMClient) {}

  async execute(input: AgentInput, context: AgentContext): Promise<AgentContext> {
    // Non-streaming fallback (not used in normal flow)
    let fullResponse = '';
    for await (const event of this.executeStream(input, context)) {
      if (event.type === 'token') fullResponse += event['content'] as string;
    }
    return { ...context, responseContent: fullResponse };
  }

  async *executeStream(input: AgentInput, context: AgentContext): AsyncGenerator<SSEEvent> {
    const systemPrompt = this.buildSystemPrompt(input.userLevel, context);
    const messages = this.buildMessages(input, context);

    const stream = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages,
      stream: true,
    });

    let fullResponse = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullResponse += event.delta.text;
        yield { type: 'token', content: event.delta.text };
      }
    }

    context.responseContent = fullResponse;

    // Extract suggested topics after streaming completes
    try {
      context.suggestedTopics = await this.extractSuggestedTopics(fullResponse);
    } catch {
      context.suggestedTopics = [];
    }
  }

  private buildSystemPrompt(level: string, context: AgentContext): string {
    const levelAdaptation = LEVEL_ADAPTATIONS[level] ?? LEVEL_ADAPTATIONS.beginner;
    const retrievedContext = (context.retrievedChunks ?? [])
      .map(
        (chunk, i) =>
          `[Source ${i + 1}: ${chunk.metadata.documentTitle}]\n${chunk.metadata.text}`,
      )
      .join('\n\n');

    return `${TEACHING_BASE_PROMPT}\n\n## Your current student's level: ${level}\n${levelAdaptation}\n\n## Retrieved reference material:\n${retrievedContext || 'No specific references found. Rely on your training knowledge.'}`;
  }

  private buildMessages(
    input: AgentInput,
    _context: AgentContext,
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const history = input.conversationHistory.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));
    return [...history, { role: 'user' as const, content: input.message }];
  }

  private async extractSuggestedTopics(response: string): Promise<string[]> {
    const res = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 100,
      temperature: 0,
      system: TOPIC_EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: response.substring(0, 2000) }],
    });
    const text = res.content[0]?.type === 'text' ? res.content[0].text : '[]';
    try {
      return JSON.parse(text) as string[];
    } catch {
      return [];
    }
  }
}
