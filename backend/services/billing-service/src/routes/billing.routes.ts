import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@cyberscout/db-client';
import { AppError } from '@cyberscout/error-handler';
import { requireAuth } from '@cyberscout/auth-middleware';
import type { PubSubClient } from '@cyberscout/redis-client';
import type { Logger } from 'pino';

// ── Stripe price IDs (set in env) ─────────────────────────────────────────────
const PRICE_IDS: Record<string, string> = {
  pro_monthly: process.env['STRIPE_PRICE_PRO_MONTHLY'] ?? '',
  max_monthly: process.env['STRIPE_PRICE_MAX_MONTHLY'] ?? '',
  pro_yearly: process.env['STRIPE_PRICE_PRO_YEARLY'] ?? '',
  max_yearly: process.env['STRIPE_PRICE_MAX_YEARLY'] ?? '',
};

const TIER_FROM_PRICE: Record<string, string> = {};
Object.entries(PRICE_IDS).forEach(([key, priceId]) => {
  if (priceId) TIER_FROM_PRICE[priceId] = key.startsWith('pro') ? 'pro' : 'max';
});

// ── Validation schemas ────────────────────────────────────────────────────────
const CheckoutSchema = z.object({
  plan: z.enum(['pro_monthly', 'max_monthly', 'pro_yearly', 'max_yearly']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// ── Router factory ────────────────────────────────────────────────────────────
export function billingRoutes(
  stripe: Stripe,
  pubsub: PubSubClient,
  logger: Logger,
): Router {
  const router = Router();

  // ── POST /subscription/checkout ─────────────────────────────────────────
  router.post(
    '/checkout',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const body = CheckoutSchema.parse(req.body);

        const priceId = PRICE_IDS[body.plan];
        if (!priceId) throw new AppError('BILLING_INVALID_PLAN', 400);

        // Get or create Stripe customer
        let subscription = await prisma.subscription.findUnique({ where: { userId } });
        let stripeCustomerId = subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            metadata: { userId },
          });
          stripeCustomerId = customer.id;
          await prisma.subscription.upsert({
            where: { userId },
            create: { userId, tier: 'free', stripeCustomerId },
            update: { stripeCustomerId },
          });
        }

        const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: body.successUrl ?? `${frontendUrl}/subscription?success=true`,
          cancel_url: body.cancelUrl ?? `${frontendUrl}/subscription?canceled=true`,
          metadata: { userId, plan: body.plan },
          subscription_data: { metadata: { userId } },
        });

        res.json({ data: { sessionId: session.id, url: session.url } });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /subscription/portal ────────────────────────────────────────────
  router.post(
    '/portal',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const subscription = await prisma.subscription.findUnique({ where: { userId } });
        if (!subscription?.stripeCustomerId)
          throw new AppError('BILLING_NO_SUBSCRIPTION', 404);

        const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: `${frontendUrl}/subscription`,
        });

        res.json({ data: { url: session.url } });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── GET /subscription/status ─────────────────────────────────────────────
  router.get(
    '/status',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const subscription = await prisma.subscription.findUnique({ where: { userId } });
        res.json({
          data: {
            tier: subscription?.tier ?? 'free',
            status: subscription?.status ?? 'active',
            periodEnd: subscription?.currentPeriodEnd ?? null,
          },
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // ── POST /webhook ────────────────────────────────────────────────────────
  // NOTE: This route must receive the raw body — mount it before express.json()
  router.post(
    '/webhook',
    async (req: Request, res: Response) => {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

      if (!sig || !webhookSecret) {
        res.status(400).send('Missing signature or webhook secret');
        return;
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
      } catch (err) {
        logger.warn({ err }, 'Webhook signature verification failed');
        res.status(400).send('Webhook signature verification failed');
        return;
      }

      try {
        await handleWebhookEvent(stripe, pubsub, logger, event);
        res.json({ received: true });
      } catch (err) {
        logger.error({ err, eventType: event.type }, 'Webhook handler error');
        res.status(500).send('Webhook handler error');
      }
    },
  );

  return router;
}

// ── Webhook event handler ────────────────────────────────────────────────────
async function handleWebhookEvent(
  stripe: Stripe,
  pubsub: PubSubClient,
  logger: Logger,
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.['userId'];
      const plan = session.metadata?.['plan'];
      if (!userId || !plan || !session.subscription) break;

      const tier = plan.startsWith('pro') ? 'pro' : 'max';
      const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier,
          status: 'active',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
        update: {
          tier,
          status: 'active',
          stripeSubscriptionId: session.subscription as string,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });

      // Update user tier
      await prisma.user.update({ where: { id: userId }, data: { tier } });

      await pubsub.publish('events:subscription.changed', { userId, tier, plan });
      logger.info({ userId, tier }, 'Subscription activated');
      break;
    }

    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as Stripe.Subscription;
      const userId = stripeSub.metadata?.['userId'];
      if (!userId) break;

      const priceId = stripeSub.items.data[0]?.price.id;
      const tier = priceId ? (TIER_FROM_PRICE[priceId] ?? 'free') : 'free';
      const status = stripeSub.status === 'active' ? 'active' : 'inactive';

      await prisma.subscription.update({
        where: { userId },
        data: { tier, status, currentPeriodEnd: new Date(stripeSub.current_period_end * 1000) },
      });
      await prisma.user.update({ where: { id: userId }, data: { tier } });
      await pubsub.publish('events:subscription.changed', { userId, tier });
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription;
      const userId = stripeSub.metadata?.['userId'];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: { tier: 'free', status: 'inactive' },
      });
      await prisma.user.update({ where: { id: userId }, data: { tier: 'free' } });
      await pubsub.publish('events:subscription.changed', { userId, tier: 'free' });
      logger.info({ userId }, 'Subscription cancelled — reverted to free');
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = (invoice.subscription_details?.metadata as any)?.['userId'];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: { status: 'past_due' },
      });
      logger.warn({ userId }, 'Payment failed — subscription past_due');
      break;
    }

    default:
      logger.debug({ eventType: event.type }, 'Unhandled webhook event');
  }
}
