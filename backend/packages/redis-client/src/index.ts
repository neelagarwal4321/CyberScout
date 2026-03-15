import Redis from 'ioredis';

export type RedisClient = Redis;

export function createRedisClient(): Redis {
  const url = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
  const client = new Redis(url, {
    retryStrategy: (times: number) => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 200, 3000);
    },
    lazyConnect: false,
    maxRetriesPerRequest: 3,
  });
  client.on('error', (err) => console.error('[Redis] Connection error:', err));
  return client;
}

// ─── PubSub ──────────────────────────────────────────────────────────────────

export interface EventPayload {
  eventType: string;
  timestamp: string;
  sourceService: string;
  data: Record<string, unknown>;
}

export class PubSubClient {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Array<(data: Record<string, unknown>) => Promise<void>>> = new Map();

  constructor(redisUrl?: string) {
    const url = redisUrl ?? process.env['REDIS_URL'] ?? 'redis://localhost:6379';
    this.publisher = new Redis(url);
    this.subscriber = new Redis(url); // Separate connection for subscribe mode

    this.subscriber.on('message', async (channel: string, raw: string) => {
      const fns = this.handlers.get(channel);
      if (!fns) return;
      try {
        const payload: EventPayload = JSON.parse(raw) as EventPayload;
        for (const fn of fns) {
          await fn(payload.data);
        }
      } catch (err) {
        console.error(`[PubSub] Handler error on ${channel}:`, err);
      }
    });
  }

  async publish(channel: string, data: Record<string, unknown>): Promise<void> {
    const payload: EventPayload = {
      eventType: channel,
      timestamp: new Date().toISOString(),
      sourceService: process.env['SERVICE_NAME'] ?? 'unknown',
      data,
    };
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  async subscribe(
    channel: string,
    handler: (data: Record<string, unknown>) => Promise<void>,
  ): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.push(handler);
  }

  async quit(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

export function createPubSub(): PubSubClient {
  return new PubSubClient();
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

export class RateLimiter {
  constructor(private redis: Redis) {}

  /**
   * Sliding window rate limit.
   * Returns true if the request is allowed, false if rate-limited.
   */
  async check(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number ?? 0;
    return count <= limit;
  }

  /**
   * Check per-user chat message rate limit based on tier.
   */
  async checkChatLimit(userId: string, tier: string): Promise<boolean> {
    const limits: Record<string, number> = { free: 50, pro: 500, max: 2000 };
    const limit = limits[tier] ?? 50;
    const key = `rl:chat:${userId}:${new Date().toISOString().slice(0, 10)}`; // daily window
    return this.check(key, limit, 86400);
  }

  async incrementConcurrent(userId: string): Promise<number> {
    const key = `concurrent:${userId}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, 60); // expire after 60s
    return count;
  }

  async decrementConcurrent(userId: string): Promise<void> {
    const key = `concurrent:${userId}`;
    const count = await this.redis.decr(key);
    if (count <= 0) await this.redis.del(key);
  }
}
