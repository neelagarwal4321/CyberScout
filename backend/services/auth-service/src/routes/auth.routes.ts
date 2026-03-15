import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@cyberscout/db-client';
import { AppError } from '@cyberscout/error-handler';
import { requireAuth, JwtPayload } from '@cyberscout/auth-middleware';
import type { RedisClient } from '@cyberscout/redis-client';
import type { User, AuthResponse } from '@cyberscout/shared-types';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  interests: z.array(z.string()).optional(),
});

const RefreshSchema = z.object({ refreshToken: z.string() });

function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) throw new Error('JWT_ACCESS_SECRET not configured');
  return jwt.sign(payload, secret, {
    expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
  });
}

function signRefreshToken(userId: string): string {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  });
}

function toApiUser(u: {
  id: string; name: string; email: string; avatar: string | null;
  tier: string; level: string; xp: number; streak: number; interests: string[]; joinedAt: Date;
}): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    tier: u.tier as User['tier'],
    level: u.level as User['level'],
    xp: u.xp,
    streak: u.streak,
    interests: u.interests,
    joinedAt: u.joinedAt.toISOString(),
  };
}

export function authRoutes(redis: RedisClient): Router {
  const router = Router();

  // ── POST /auth/signup ──────────────────────────────────────────────────────
  router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = SignupSchema.parse(req.body);

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) throw new AppError('AUTH_EMAIL_IN_USE', 409);

      const hashed = await bcrypt.hash(body.password, 12);
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashed,
          name: body.name,
          level: (body.experienceLevel as 'beginner' | 'intermediate' | 'advanced') ?? 'beginner',
          interests: body.interests ?? [],
          subscription: { create: { tier: 'free' } },
        },
      });

      const accessToken = signAccessToken({ sub: user.id, email: user.email, tier: user.tier, level: user.level });
      const refreshToken = signRefreshToken(user.id);

      // Persist refresh token (7-day expiry)
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const response: AuthResponse = {
        user: toApiUser(user),
        tokens: { accessToken, refreshToken, expiresIn: 900 },
      };
      res.status(201).json({ data: response });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /auth/login ───────────────────────────────────────────────────────
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = LoginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !user.password) throw new AppError('AUTH_INVALID_CREDENTIALS', 401);

      const valid = await bcrypt.compare(body.password, user.password);
      if (!valid) throw new AppError('AUTH_INVALID_CREDENTIALS', 401);

      const accessToken = signAccessToken({ sub: user.id, email: user.email, tier: user.tier, level: user.level });
      const refreshToken = signRefreshToken(user.id);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Cache user session in Redis for fast reads
      await redis.setex(`user:${user.id}`, 900, JSON.stringify(toApiUser(user)));

      const response: AuthResponse = {
        user: toApiUser(user),
        tokens: { accessToken, refreshToken, expiresIn: 900 },
      };
      res.json({ data: response });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /auth/refresh ─────────────────────────────────────────────────────
  router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = RefreshSchema.parse(req.body);

      const secret = process.env['JWT_REFRESH_SECRET'];
      if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
      const payload = jwt.verify(refreshToken, secret) as { sub: string };

      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.expiresAt < new Date()) {
        throw new AppError('AUTH_TOKEN_INVALID', 401);
      }

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new AppError('AUTH_USER_NOT_FOUND', 401);

      // Rotate: delete old, issue new
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      const newRefresh = signRefreshToken(user.id);
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefresh,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const newAccess = signAccessToken({ sub: user.id, email: user.email, tier: user.tier, level: user.level });
      res.json({ data: { accessToken: newAccess, refreshToken: newRefresh, expiresIn: 900 } });
    } catch (err) {
      next(err);
    }
  });

  // ── POST /auth/logout ──────────────────────────────────────────────────────
  router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }
      // Invalidate Redis session
      if (req.user) {
        await redis.del(`user:${req.user.sub}`);
      }
      res.json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /auth/me ───────────────────────────────────────────────────────────
  router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Try Redis cache first
      const cached = await redis.get(`user:${req.user!.sub}`);
      if (cached) {
        return res.json({ data: JSON.parse(cached) });
      }

      const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
      if (!user) throw new AppError('AUTH_USER_NOT_FOUND', 404);

      const apiUser = toApiUser(user);
      await redis.setex(`user:${user.id}`, 900, JSON.stringify(apiUser));
      res.json({ data: apiUser });
    } catch (err) {
      next(err);
    }
  });

  // ── GET /internal/users/:id ───────────────────────────────────────────────
  // Internal route — called by other services
  router.get('/internal/users/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cached = await redis.get(`user:${req.params['id']}`);
      if (cached) return res.json({ data: JSON.parse(cached) });

      const user = await prisma.user.findUnique({ where: { id: req.params['id'] } });
      if (!user) throw new AppError('AUTH_USER_NOT_FOUND', 404);

      res.json({ data: toApiUser(user) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
