import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../utils/redis';

const prisma = new PrismaClient();

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const redis = getRedis();
    const top = await (redis as any).zrevrange('leaderboard:global', 0, 49, 'WITHSCORES');
    const entries = [];
    for (let i = 0; i < top.length; i += 2) {
      entries.push({ user_id: top[i], xp: parseInt(top[i + 1]), rank: i / 2 + 1 });
    }
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const redis = getRedis();
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { xp_total: true, level: true },
    });
    const rank = await redis.zrevrank('leaderboard:global', userId);
    const badges = await prisma.user_achievements.findMany({
      where: { user_id: userId },
      include: {
        achievements: { select: { name: true, slug: true, icon_r2_key: true, xp_bonus: true } },
      },
      orderBy: { earned_at: 'desc' },
      take: 10,
    });
    res.json({
      data: {
        xp_total: user?.xp_total ?? 0,
        level: user?.level ?? 1,
        rank: rank !== null ? rank + 1 : null,
        badges,
      },
    });
  } catch (err) {
    next(err);
  }
}
