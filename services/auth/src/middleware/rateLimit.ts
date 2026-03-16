import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../utils/redis';

export function rateLimit(limit = 100, windowSecs = 60) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || 'unknown';
    const bucket = Math.floor(Date.now() / (windowSecs * 1000));
    const key = `rate:${ip}:${bucket}`;
    const redis = getRedis();
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSecs);
    if (count > limit) {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests', statusCode: 429 } });
      return;
    }
    next();
  };
}
