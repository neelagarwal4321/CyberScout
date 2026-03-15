import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger } from '@cyberscout/logger';
import { prisma } from '@cyberscout/db-client';
import { createRedisClient } from '@cyberscout/redis-client';
import { errorHandler } from '@cyberscout/error-handler';
import { authRoutes } from './routes/auth.routes';

const logger = createLogger('auth-service');
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

async function main() {
  const redis = createRedisClient();

  const app = express();

  app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'auth-service', uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.use('/auth', authRoutes(redis));
  app.use(errorHandler as express.ErrorRequestHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Auth service started');
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close();
    await prisma.$disconnect();
    await redis.quit();
    logger.info('Auth service shut down');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
