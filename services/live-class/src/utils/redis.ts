import Redis from 'ioredis';
import { logger } from './logger';
let client: Redis;
export function getRedis(): Redis {
  if (!client) { client = new Redis(process.env.REDIS_URL!, { lazyConnect: false }); client.on('error', (err) => logger.error({ err }, 'Redis error')); }
  return client;
}
