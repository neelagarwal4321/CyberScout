import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import { z } from 'zod';

const prisma = new PrismaClient();

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional(),
});

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, avatar_url: true, tier: true, xp_total: true, level: true, created_at: true },
    });
    if (!user) throw new AppError('USER_NOT_FOUND', 404);
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function patchMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', statusCode: 400, details: parsed.error.errors } }); return; }

    const user = await prisma.users.update({
      where: { id: req.user!.id },
      data: parsed.data,
      select: { id: true, email: true, name: true, avatar_url: true, tier: true },
    });
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sub = await prisma.subscriptions.findUnique({ where: { user_id: req.user!.id } });
    res.json({ data: sub || { tier: 'free', status: 'active' } });
  } catch (err) { next(err); }
}
