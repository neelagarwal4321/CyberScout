import { prisma } from '@cyberscout/db-client';
import type { Agent, AgentInput, AgentContext, LLMClient } from './types';

const ASSESSMENT_SYSTEM_PROMPT = `You are a quiz question generator for a cybersecurity education platform.

Generate a single multiple-choice question based on the topic, student level, and mastery score.

Use Bloom's Taxonomy difficulty tiers:
- recall: simple definition/identification questions (score < 30%)
- understanding: explain/compare questions (score 30-60%)
- application: solve/demonstrate questions (score 60-80%)
- analysis: critique/evaluate questions (score > 80%)

Respond ONLY with JSON:
{
  "question": "What is the primary purpose of a firewall?",
  "options": ["To encrypt network traffic", "To filter network packets based on rules", "To store user credentials", "To compress data for faster transmission"],
  "correctIndex": 1,
  "explanation": "A firewall filters network packets using predefined rules to allow or block traffic...",
  "topic": "network-security",
  "difficulty": "recall"
}

Never include explanations outside the JSON. Only return valid JSON.`;

export class AssessmentAgent implements Agent {
  name = 'assessment';

  constructor(private llm: LLMClient) {}

  async execute(input: AgentInput, context: AgentContext): Promise<AgentContext> {
    const topic =
      context.suggestedTopics?.[0] ?? input.currentTopic ?? 'general-cybersecurity';

    const mastery = await this.getMastery(input.userId, topic);
    const difficulty = this.mapMasteryToDifficulty(mastery.masteryScore);

    const response = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 400,
      temperature: 0.4,
      system: ASSESSMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Topic: ${topic}\nStudent level: ${input.userLevel}\nMastery: ${mastery.masteryScore}%\nDifficulty tier: ${difficulty}\nRecent teaching context: ${context.responseContent?.substring(0, 500) ?? 'N/A'}\n\nGenerate a quiz question.`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    try {
      const quiz = JSON.parse(text);
      return { ...context, quiz };
    } catch {
      return context;
    }
  }

  private async getMastery(
    userId: string,
    topic: string,
  ): Promise<{ masteryScore: number }> {
    const mastery = await prisma.topicMastery.findUnique({
      where: { userId_topic: { userId, topic } },
    });
    // Apply lazy decay: 1 point per week of inactivity
    if (mastery) {
      const weeksSinceAssessed =
        (Date.now() - mastery.lastAssessed.getTime()) / (1000 * 60 * 60 * 24 * 7);
      const decayed = Math.max(0, mastery.masteryScore - Math.floor(weeksSinceAssessed));
      return { masteryScore: decayed };
    }
    return { masteryScore: 0 };
  }

  private mapMasteryToDifficulty(score: number): string {
    if (score < 30) return 'recall';
    if (score < 60) return 'understanding';
    if (score < 80) return 'application';
    return 'analysis';
  }
}
