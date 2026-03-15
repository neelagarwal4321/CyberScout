import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createLogger } from '@cyberscout/logger';
import { prisma } from '@cyberscout/db-client';
import { createRedisClient, createPubSub } from '@cyberscout/redis-client';
import { errorHandler } from '@cyberscout/error-handler';
import { billingRoutes } from './routes/billing.routes';

const logger = createLogger('billing-service');
const PORT = parseInt(process.env['PORT'] ?? '3004', 10);

async function main() {
  const redis = createRedisClient();
  const pubsub = createPubSub();

  const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '', {
    apiVersion: '2024-11-20.acacia',
  });

  // Create Stripe customer when a new user registers
  await pubsub.subscribe('events:user.created', async (event: any) => {
    if (!event.userId || !event.email) return;
    try {
      const customer = await stripe.customers.create({
        email: event.email,
        metadata: { userId: event.userId },
      });
      await prisma.subscription.upsert({
        where: { userId: event.userId },
        create: { userId: event.userId, tier: 'free', stripeCustomerId: customer.id },
        update: { stripeCustomerId: customer.id },
      });
      logger.info({ userId: event.userId }, 'Stripe customer created');
    } catch (err) {
      logger.error({ err, userId: event.userId }, 'Failed to create Stripe customer');
    }
  });

  // Cancel Stripe subscription when a user deletes their account
  await pubsub.subscribe('events:user.deleted', async (event: any) => {
    if (!event.userId) return;
    try {
      const sub = await prisma.subscription.findUnique({ where: { userId: event.userId } });
      if (sub?.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
        logger.info({ userId: event.userId }, 'Stripe subscription cancelled on user deletion');
      }
    } catch (err) {
      logger.error({ err, userId: event.userId }, 'Failed to cancel Stripe subscription');
    }
  });

  const app = express();

  // Webhook route MUST use raw body — mount before express.json()
  app.post(
    '/subscription/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      // Re-route to the router handler
      req.url = '/webhook';
      billingRoutes(stripe, pubsub, logger)(req, res, next);
    },
  );

  app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'billing-service', uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.use('/subscription', billingRoutes(stripe, pubsub, logger));
  app.use(errorHandler as express.ErrorRequestHandler);

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Billing service started');
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close();
    await prisma.$disconnect();
    await pubsub.quit();
    await redis.quit();
    logger.info('Billing service shut down');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
