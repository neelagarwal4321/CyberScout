import { getRedis } from '../utils/redis';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const STREAMS = ['stream:payment_succeeded', 'stream:payment_failed'];
const GROUP = 'user-consumers';
const CONSUMER = 'user-worker-1';

export async function startConsumer(): Promise<void> {
  const redis = getRedis();

  for (const stream of STREAMS) {
    try {
      await (redis as any).xgroup('CREATE', stream, GROUP, '$', 'MKSTREAM');
    } catch { /* group exists */ }
  }

  logger.info('User event consumer started');

  while (true) {
    try {
      const results = await (redis as any).xreadgroup(
        'GROUP', GROUP, CONSUMER, 'COUNT', '10', 'BLOCK', '2000',
        'STREAMS', ...STREAMS, ...STREAMS.map(() => '>')
      );

      if (!results) continue;

      for (const [stream, messages] of results as [string, [string, string[]][]][]) {
        for (const [id, fields] of messages) {
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) data[fields[i]] = fields[i + 1];

          try {
            await processEvent(stream, data);
            await (redis as any).xack(stream, GROUP, id);
          } catch (err) {
            logger.error({ err, stream, id }, 'Event processing failed');
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Consumer loop error');
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function processEvent(stream: string, data: Record<string, string>): Promise<void> {
  const redis = getRedis();

  if (stream === 'stream:payment_succeeded') {
    const { user_id, tier_purchased } = data;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscriptions.upsert({
      where: { user_id },
      create: { user_id, tier: tier_purchased as any, status: 'active', current_period_start: now, current_period_end: periodEnd },
      update: { tier: tier_purchased as any, status: 'active', current_period_start: now, current_period_end: periodEnd, cancel_at_period_end: false },
    });

    await redis.del(`perm:${user_id}`);
    logger.info({ user_id, tier_purchased }, 'Subscription upgraded');
  }

  if (stream === 'stream:payment_failed') {
    const { user_id } = data;
    await prisma.subscriptions.updateMany({ where: { user_id }, data: { status: 'past_due' } });
    await redis.del(`perm:${user_id}`);
    logger.info({ user_id }, 'Subscription marked past_due');
  }
}
