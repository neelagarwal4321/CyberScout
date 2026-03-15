import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger } from '@cyberscout/logger';
import { prisma } from '@cyberscout/db-client';
import { createRedisClient, createPubSub } from '@cyberscout/redis-client';
import { errorHandler } from '@cyberscout/error-handler';
import { courseRoutes } from './routes/course.routes';

const logger = createLogger('course-service');
const PORT = parseInt(process.env['PORT'] ?? '3002', 10);

async function main() {
  const redis = createRedisClient();
  const pubsub = createPubSub();

  // Listen for subscription changes to recalculate accessible content
  await pubsub.subscribe('events:subscription.changed', async (event: any) => {
    // Invalidate user's course cache so next request re-evaluates access
    await redis.del(`dashboard:${event.userId}`);
    logger.info({ userId: event.userId }, 'Cleared dashboard cache after subscription change');
  });

  const app = express();

  app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'course-service', uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.use('/courses', courseRoutes(redis, pubsub));
  app.use(errorHandler as express.ErrorRequestHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Course service started');
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await prisma.$disconnect();
    await pubsub.quit();
    await redis.quit();
    logger.info('Course service shut down');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
