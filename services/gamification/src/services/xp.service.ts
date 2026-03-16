import { PrismaClient } from '@prisma/client';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const LEVELS = [
  { level: 1, name: 'Script Kiddie', minXP: 0 },
  { level: 2, name: 'Packet Sniffer', minXP: 500 },
  { level: 3, name: 'Firewall Breaker', minXP: 1500 },
  { level: 4, name: 'Cipher Cracker', minXP: 3000 },
  { level: 5, name: 'Exploit Hunter', minXP: 5000 },
  { level: 6, name: 'Zero Day Finder', minXP: 8000 },
  { level: 7, name: 'Incident Commander', minXP: 12000 },
  { level: 8, name: 'Cyber Sentinel', minXP: 20000 },
];

const XP_TABLE: Record<string, number> = {
  lesson_completed: 50,
  course_completed: 500,
  class_attended: 75,
  login_streak_7: 100,
  login_streak_30: 500,
  quiz_90pct: 150,
};

export async function awardXP(userId: string, delta: number, reason: string, referenceId?: string): Promise<void> {
  const redis = getRedis();
  const user = await prisma.users.findUnique({ where: { id: userId }, select: { xp_total: true, level: true } });
  if (!user) return;

  const balanceAfter = user.xp_total + delta;
  await prisma.xp_ledger.create({
    data: { user_id: userId, delta, reason, reference_id: referenceId || null, balance_after: balanceAfter },
  });

  await redis.zadd('leaderboard:global', balanceAfter, userId);
  const month = new Date().toISOString().slice(0, 7);
  await redis.zadd(`leaderboard:monthly:${month}`, balanceAfter, userId);

  await checkLevelUp(userId, balanceAfter, user.level);
}

async function checkLevelUp(userId: string, xp: number, currentLevel: number): Promise<void> {
  const newLevel = LEVELS.filter((l) => xp >= l.minXP).pop();
  if (newLevel && newLevel.level > currentLevel) {
    await prisma.users.update({ where: { id: userId }, data: { level: newLevel.level } });
    await getRedis().xadd(
      'stream:level_up', '*',
      'user_id', userId,
      'old_level', currentLevel.toString(),
      'new_level', newLevel.level.toString(),
      'level_name', newLevel.name
    );
    logger.info({ userId, newLevel: newLevel.level, name: newLevel.name }, 'Level up!');
  }
}

export async function evaluateBadges(userId: string, eventType: string): Promise<void> {
  const badges = await prisma.achievements.findMany({ where: { is_active: true, trigger_type: eventType } });
  for (const badge of badges) {
    const alreadyEarned = await prisma.user_achievements.findUnique({
      where: { user_id_achievement_id: { user_id: userId, achievement_id: badge.id } },
    });
    if (alreadyEarned) continue;
    await prisma.user_achievements.create({
      data: { user_id: userId, achievement_id: badge.id, xp_credited: badge.xp_bonus },
    });
    if (badge.xp_bonus > 0) await awardXP(userId, badge.xp_bonus, 'badge_earned', badge.id);
    await getRedis().xadd(
      'stream:badge_unlocked', '*',
      'user_id', userId,
      'badge_slug', badge.slug,
      'badge_name', badge.name,
      'xp_bonus', badge.xp_bonus.toString()
    );
  }
}

export async function processGamificationEvent(stream: string, data: Record<string, string>): Promise<void> {
  const { user_id } = data;
  if (!user_id) return;

  if (stream === 'stream:lesson_completed') {
    await awardXP(user_id, XP_TABLE.lesson_completed, 'lesson_completed', data.lesson_id);
    await evaluateBadges(user_id, 'lesson_completed');
  } else if (stream === 'stream:class_attended') {
    await awardXP(user_id, XP_TABLE.class_attended, 'class_attended', data.class_id);
    await evaluateBadges(user_id, 'class_attended');
  } else if (stream === 'stream:login_streak') {
    const streak = parseInt(data.streak_days || '0');
    if (streak >= 30) await awardXP(user_id, XP_TABLE.login_streak_30, 'login_streak_30');
    else if (streak >= 7) await awardXP(user_id, XP_TABLE.login_streak_7, 'login_streak_7');
  } else if (stream === 'stream:payment_succeeded') {
    await evaluateBadges(user_id, 'payment_succeeded');
  }
}
