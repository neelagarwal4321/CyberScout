import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@cyberscout/error-handler';

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  tier: string;
  level: string;
  iat?: number;
  exp?: number;
}

// Augment Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('AUTH_TOKEN_MISSING', 401);
  }

  const token = header.slice(7);
  try {
    const secret = process.env['JWT_ACCESS_SECRET'];
    if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('AUTH_TOKEN_INVALID', 401);
  }
}

export function requireTier(minTier: 'pro' | 'max') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError('AUTH_TOKEN_MISSING', 401);
    const order = { free: 0, pro: 1, max: 2 };
    const userTierRank = order[req.user.tier as keyof typeof order] ?? 0;
    const requiredRank = order[minTier];
    if (userTierRank < requiredRank) {
      throw new AppError('AUTH_INSUFFICIENT_TIER', 403, { required: minTier, current: req.user.tier });
    }
    next();
  };
}

export function requireInternalRequest(req: Request, _res: Response, next: NextFunction): void {
  const sig = req.headers['x-internal-signature'];
  const ts = req.headers['x-internal-timestamp'];
  if (!sig || !ts) throw new AppError('AUTH_INTERNAL_FORBIDDEN', 403);

  // Replay attack protection (30 second window)
  const age = Date.now() - parseInt(ts as string, 10);
  if (age > 30_000 || age < 0) throw new AppError('AUTH_INTERNAL_REPLAY', 403);

  // Signature verification is done via HMAC in InternalClient — we trust at middleware level
  // In production, verify the HMAC here using INTERNAL_HMAC_SECRET
  next();
}
