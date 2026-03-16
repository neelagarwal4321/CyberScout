import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notification.routes';
import { logger } from './utils/logger';
import { getRedis } from './utils/redis';
import { PrismaClient } from '@prisma/client';
import { startConsumer } from './events/consumer';
const app = express();
const prisma = new PrismaClient();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification' }));
app.use('/api/v1/notifications', notificationRoutes);
const PORT = parseInt(process.env.PORT || '3009');
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Notification service started');
  startConsumer().catch(err => logger.error({ err }, 'Consumer crashed'));
});
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutdown'); server.close(); await new Promise(r => setTimeout(r, 5000));
  await prisma.$disconnect(); await getRedis().quit(); process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
