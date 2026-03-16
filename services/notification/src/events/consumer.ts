import { getRedis } from '../utils/redis';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../services/email.service';
import { logger } from '../utils/logger';
const prisma = new PrismaClient();

const STREAMS = ['stream:badge_unlocked', 'stream:level_up', 'stream:payment_succeeded', 'stream:payment_failed', 'stream:user_registered'];
const GROUP = 'notification-consumers';
const CONSUMER = 'notification-worker-1';

export async function startConsumer(): Promise<void> {
  const redis = getRedis();
  for (const stream of STREAMS) {
    try { await (redis as any).xgroup('CREATE', stream, GROUP, '$', 'MKSTREAM'); } catch { /* exists */ }
  }
  logger.info('Notification event consumer started');
  while (true) {
    try {
      const results = await (redis as any).xreadgroup('GROUP', GROUP, CONSUMER, 'COUNT', '10', 'BLOCK', '2000', 'STREAMS', ...STREAMS, ...STREAMS.map(() => '>'));
      if (!results) continue;
      for (const [stream, messages] of results as [string, [string, string[]][]][]) {
        for (const [id, fields] of messages) {
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) data[fields[i]] = fields[i + 1];
          try {
            await processEvent(stream, data);
            await (redis as any).xack(stream, GROUP, id);
          } catch (err) { logger.error({ err, stream, id }, 'Event processing failed'); }
        }
      }
    } catch (err) { logger.error({ err }, 'Consumer loop error'); await new Promise(r => setTimeout(r, 1000)); }
  }
}

async function processEvent(stream: string, data: Record<string, string>): Promise<void> {
  const { user_id } = data;
  if (!user_id) return;

  const eventMap: Record<string, { title: string; body: string; type: string }> = {
    'stream:badge_unlocked': { type: 'badge', title: `Badge Earned: ${data.badge_name || ''}`, body: `You earned the "${data.badge_name}" badge! +${data.xp_bonus} XP` },
    'stream:level_up': { type: 'level_up', title: `Level Up! You're now ${data.level_name || 'Level ' + data.new_level}`, body: `Congratulations on reaching level ${data.new_level}!` },
    'stream:payment_succeeded': { type: 'payment', title: 'Payment Successful', body: `Your ${data.tier_purchased} subscription is now active.` },
    'stream:payment_failed': { type: 'payment_failed', title: 'Payment Failed', body: 'Your recent payment could not be processed. Please update your payment method.' },
    'stream:user_registered': { type: 'welcome', title: 'Welcome to CyberScout!', body: 'Start your cybersecurity journey today.' },
  };

  const notif = eventMap[stream];
  if (!notif) return;

  await prisma.notifications.create({ data: { user_id, type: notif.type, title: notif.title, body: notif.body, sent_at: new Date() } });

  const templateMap: Record<string, string> = {
    'stream:user_registered': 'user_registered', 'stream:payment_succeeded': 'payment_succeeded',
    'stream:badge_unlocked': 'badge_unlocked', 'stream:level_up': 'level_up', 'stream:payment_failed': 'payment_failed',
  };
  if (templateMap[stream]) {
    await sendEmail(user_id, templateMap[stream], { message: notif.body });
  }
}
