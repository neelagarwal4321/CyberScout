import { prisma } from '@cyberscout/db-client';
import type { Agent, AgentInput, AgentContext, LLMClient, RetrievedChunk, Citation } from './types';

interface ScoredChunk extends RetrievedChunk {
  rrfScore?: number;
}

export class RetrievalAgent implements Agent {
  name = 'retrieval';

  constructor(
    private vectorStore: VectorStore | null,
    private embedder: EmbeddingService | null,
    private llm: LLMClient,
  ) {}

  async execute(input: AgentInput, context: AgentContext): Promise<AgentContext> {
    // Step 1: Query reformulation
    const searchQuery = await this.reformulateQuery(input);

    // Step 2: Dense vector search (if Pinecone is configured)
    let denseResults: ScoredChunk[] = [];
    if (this.vectorStore && this.embedder) {
      try {
        const embedding = await this.embedder.embed(searchQuery);
        denseResults = await this.vectorStore.query({
          vector: embedding,
          topK: 20,
          filter: this.buildFilter(input),
        });
      } catch {
        // Non-fatal — continue without dense results
      }
    }

    // Step 3: Sparse keyword search (PostgreSQL full-text)
    const sparseResults = await this.keywordSearch(searchQuery, 10);

    // Step 4: Reciprocal Rank Fusion
    const fusedResults = this.reciprocalRankFusion(denseResults, sparseResults);
    const top12 = fusedResults.slice(0, 12);

    // Step 5: Rerank top 12 → top 4
    const top4 = top12.length > 0 ? await this.rerank(searchQuery, top12) : [];

    const citations: Citation[] = top4.map((chunk) => ({
      source: chunk.metadata.source,
      documentTitle: chunk.metadata.documentTitle,
      section: chunk.metadata.section,
      url: chunk.metadata.url,
      relevanceScore: chunk.score,
    }));

    return { ...context, retrievedChunks: top4, citations };
  }

  private async reformulateQuery(input: AgentInput): Promise<string> {
    const historyContext = input.conversationHistory
      .slice(-3)
      .map((m) => `${m.role}: ${m.content.substring(0, 150)}`)
      .join('\n');

    const response = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 100,
      temperature: 0,
      system:
        'You reformulate conversational messages into precise search queries for a cybersecurity knowledge base. Output ONLY the search query, nothing else.',
      messages: [
        {
          role: 'user',
          content: `Conversation:\n${historyContext}\n\nLatest message: "${input.message}"\n\nSearch query:`,
        },
      ],
    });

    return response.content[0]?.type === 'text'
      ? response.content[0].text.trim()
      : input.message;
  }

  private buildFilter(input: AgentInput): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    const levelOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
    const maxLevel = levelOrder[input.userLevel] ?? 0;
    filter['difficulty'] = {
      $in: Object.entries(levelOrder)
        .filter(([, v]) => v <= maxLevel)
        .map(([k]) => k),
    };
    if (input.courseId) filter['courseId'] = input.courseId;
    return filter;
  }

  private async keywordSearch(query: string, limit: number): Promise<ScoredChunk[]> {
    // Use PostgreSQL full-text search on knowledge chunks
    const results = await prisma.$queryRaw<Array<{ id: string; content: string; metadata: string; rank: number }>>`
      SELECT id, content, metadata::text, ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) as rank
      FROM "KnowledgeChunk"
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    return results.map((r, i) => ({
      id: r.id,
      score: r.rank,
      metadata: {
        text: r.content,
        source: 'database',
        documentTitle: 'Course Content',
        section: '',
        ...((() => { try { return JSON.parse(r.metadata); } catch { return {}; } })()),
      },
    }));
  }

  private reciprocalRankFusion(
    dense: ScoredChunk[],
    sparse: ScoredChunk[],
    k = 60,
  ): ScoredChunk[] {
    const scoreMap = new Map<string, { chunk: ScoredChunk; score: number }>();

    dense.forEach((chunk, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      const existing = scoreMap.get(chunk.id);
      scoreMap.set(chunk.id, { chunk, score: (existing?.score ?? 0) + rrfScore });
    });

    sparse.forEach((chunk, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      const existing = scoreMap.get(chunk.id);
      scoreMap.set(chunk.id, {
        chunk: existing?.chunk ?? chunk,
        score: (existing?.score ?? 0) + rrfScore,
      });
    });

    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .map((item) => ({ ...item.chunk, score: item.score }));
  }

  private async rerank(query: string, chunks: ScoredChunk[]): Promise<ScoredChunk[]> {
    if (chunks.length <= 4) return chunks.slice(0, 4);

    const response = await this.llm.client.messages.create({
      model: this.llm.model,
      max_tokens: 200,
      temperature: 0,
      system:
        'You are a relevance ranker. Given a query and document chunks, return a JSON array of indices sorted by relevance (most relevant first). Only return the JSON array of numbers, e.g. [2,0,3,1].',
      messages: [
        {
          role: 'user',
          content: `Query: "${query}"\n\nChunks:\n${chunks.map((c, i) => `[${i}] ${c.metadata.text.substring(0, 300)}`).join('\n\n')}\n\nRank by relevance (top 4 only):`,
        },
      ],
    });

    const text =
      response.content[0]?.type === 'text' ? response.content[0].text : '[]';
    try {
      const ranking: number[] = JSON.parse(text);
      return ranking
        .slice(0, 4)
        .map((idx) => chunks[idx])
        .filter(Boolean);
    } catch {
      return chunks.slice(0, 4);
    }
  }
}

// ── Stubs for optional Pinecone integration ───────────────────────────────────

export class VectorStore {
  private index: any;

  constructor(apiKey: string | undefined) {
    if (!apiKey) return;
    try {
      const { Pinecone } = require('@pinecone-database/pinecone');
      const pc = new Pinecone({ apiKey });
      this.index = pc.index(process.env['PINECONE_INDEX'] ?? 'cyberscout');
    } catch {
      // Pinecone not configured — fall back to DB-only retrieval
    }
  }

  async query(params: {
    vector: number[];
    topK: number;
    filter?: Record<string, unknown>;
  }): Promise<ScoredChunk[]> {
    if (!this.index) return [];
    const result = await this.index.query({
      vector: params.vector,
      topK: params.topK,
      filter: params.filter,
      includeMetadata: true,
    });
    return (result.matches ?? []).map((m: any) => ({
      id: m.id,
      score: m.score ?? 0,
      metadata: {
        text: m.metadata?.text ?? '',
        source: m.metadata?.source ?? '',
        documentTitle: m.metadata?.documentTitle ?? '',
        section: m.metadata?.section ?? '',
        url: m.metadata?.url,
        difficulty: m.metadata?.difficulty,
        courseId: m.metadata?.courseId,
      },
    }));
  }

  async upsert(vectors: any[], opts?: { namespace?: string }): Promise<void> {
    if (!this.index) return;
    await this.index.namespace(opts?.namespace ?? '').upsert(vectors);
  }
}

export class EmbeddingService {
  private client: import('@anthropic-ai/sdk').default;

  constructor(apiKey: string) {
    const Anthropic = require('@anthropic-ai/sdk').default;
    this.client = new Anthropic({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    // Anthropic does not yet expose a dedicated embedding endpoint in the public SDK.
    // Use voyage-3 via the embeddings beta if available, otherwise return empty.
    // For production, replace with OpenAI ada-002 or Cohere embed-v3.
    try {
      const res = await (this.client as any).embeddings.create({
        model: 'voyage-3',
        input: text,
        input_type: 'query',
      });
      return res.data?.[0]?.embedding ?? [];
    } catch {
      return [];
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
