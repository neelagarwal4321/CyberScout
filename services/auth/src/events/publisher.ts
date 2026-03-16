import { getRedis } from '../utils/redis';

export async function publishEvent(stream: string, data: Record<string, string>): Promise<void> {
  const redis = getRedis();
  const args: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    args.push(k, v);
  }
  await (redis as any).xadd(stream, '*', ...args);
}
