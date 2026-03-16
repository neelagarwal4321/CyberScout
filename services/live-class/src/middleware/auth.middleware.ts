import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { getRedis } from '../utils/redis';
const PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_FILE!, 'utf-8');
interface JWTPayload { sub: string; email: string; tier: string; jti: string; }
declare global { namespace Express { interface Request { user?: { id: string; email: string; tier: string; jti: string }; } } }
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Missing token', statusCode: 401 } }); return; }
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as JWTPayload;
    const blocked = await getRedis().get(`jti_block:${payload.jti}`);
    if (blocked) throw new Error('Token revoked');
    req.user = { id: payload.sub, email: payload.email, tier: payload.tier, jti: payload.jti };
    next();
  } catch { res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Invalid token', statusCode: 401 } }); }
}
export function requireTier(minTier: string) {
  const tierRank: Record<string, number> = { free: 0, beginner: 1, intermediate: 2, pro: 3 };
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || tierRank[req.user.tier] < tierRank[minTier]) { res.status(403).json({ error: { code: 'TIER_INSUFFICIENT', message: `Requires ${minTier} subscription`, upgrade_url: '/pricing', statusCode: 403 } }); return; }
    next();
  };
}
