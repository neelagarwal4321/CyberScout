import { getRedis } from '../utils/redis';
import { processGamificationEvent } from '../services/xp.service';
import { logger } from '../utils/logger';

const STREAMS = [
  'stream:lesson_completed',
  'stream:class_attended',
  'stream:login_streak',
  'stream:payment_succeeded',
];
const GROUP = 'gamification-consumers';
const CONSUMER = 'gamification-worker-1';

export async function startConsumer(): Promise<void> {
  const redis = getRedis();
  for (const stream of STREAMS) {
    try {
      await (redis as any).xgroup('CREATE', stream, GROUP, '$', 'MKSTREAM');
    } catch {
      /* group already exists */
    }
  }
  logger.info('Gamification event consumer started');
  while (true) {
    try {
      const results = await (redis as any).xreadgroup(
        'GROUP', GROUP, CONSUMER,
        'COUNT', '10',
        'BLOCK', '2000',
        'STREAMS', ...STREAMS, ...STREAMS.map(() => '>')
      );
      if (!results) continue;
      for (const [stream, messages] of results as [string, [string, string[]][]][]) {
        for (const [id, fields] of messages) {
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) data[fields[i]] = fields[i + 1];
          try {
            await processGamificationEvent(stream, data);
            await (redis as any).xack(stream, GROUP, id);
          } catch (err) {
            logger.error({ err, stream, id }, 'Event processing failed');
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Consumer loop error');
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
