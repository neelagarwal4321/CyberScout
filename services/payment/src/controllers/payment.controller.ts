import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const TIER_PRICES: Record<string, number> = { beginner: 29900, intermediate: 59900, pro: 99900 };

function getRazorpay(): Razorpay {
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tier } = req.body;
    const amount = TIER_PRICES[tier];
    if (!amount) { res.status(400).json({ error: { code: 'INVALID_TIER', message: 'Invalid tier', statusCode: 400 } }); return; }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `rcpt_${req.user!.id}_${Date.now()}` });

    const idempotencyKey = `${order.id}_order_created`;
    await prisma.payments.create({
      data: { user_id: req.user!.id, razorpay_order_id: order.id, amount_paise: amount, tier_purchased: tier as any, idempotency_key: idempotencyKey, status: 'pending' }
    });

    res.json({ data: { razorpay_order_id: order.id, amount_paise: amount, currency: 'INR', razorpay_key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (err) { next(err); }
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody as Buffer;

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expected))) {
    res.status(400).json({ error: 'Invalid signature' }); return;
  }

  const event = JSON.parse(rawBody.toString());
  const redis = getRedis();

  const orderId = event.payload?.payment?.entity?.order_id || event.payload?.subscription?.entity?.id;
  const idempKey = `${orderId}_${event.event}`;
  const existing = await prisma.payments.findFirst({ where: { idempotency_key: idempKey } });
  if (existing && existing.status !== 'pending') { res.json({ status: 'already_processed' }); return; }

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment.entity;
      const record = await prisma.payments.findFirst({ where: { razorpay_order_id: payment.order_id } });
      if (record) {
        await prisma.payments.update({ where: { id: record.id }, data: { status: 'captured', razorpay_payment_id: payment.id, razorpay_event_payload: payment } });
        const now = new Date();
        const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + 1);
        await prisma.subscriptions.upsert({
          where: { user_id: record.user_id },
          create: { user_id: record.user_id, tier: record.tier_purchased as any, status: 'active', current_period_start: now, current_period_end: periodEnd },
          update: { tier: record.tier_purchased as any, status: 'active', current_period_start: now, current_period_end: periodEnd, cancel_at_period_end: false }
        });
        await redis.del(`perm:${record.user_id}`);
        await redis.xadd('stream:payment_succeeded', '*', 'user_id', record.user_id, 'amount_paise', record.amount_paise.toString(), 'tier_purchased', record.tier_purchased!, 'razorpay_payment_id', payment.id);
        await redis.xadd('stream:subscription_upgraded', '*', 'user_id', record.user_id, 'new_tier', record.tier_purchased!);
        logger.info({ userId: record.user_id, tier: record.tier_purchased }, 'Payment captured');
      }
      break;
    }
    case 'payment.failed': {
      const payment = event.payload.payment.entity;
      const record = await prisma.payments.findFirst({ where: { razorpay_order_id: payment.order_id } });
      if (record) {
        await prisma.payments.update({ where: { id: record.id }, data: { status: 'failed' } });
        await redis.xadd('stream:payment_failed', '*', 'user_id', record.user_id);
      }
      break;
    }
    case 'subscription.halted': {
      const sub = event.payload.subscription.entity;
      const record = await prisma.subscriptions.findFirst({ where: { razorpay_sub_id: sub.id } });
      if (record) {
        await prisma.subscriptions.update({ where: { id: record.id }, data: { status: 'past_due', tier: 'free' as any } });
        await redis.del(`perm:${record.user_id}`);
      }
      break;
    }
  }

  res.json({ status: 'received' });
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payments = await prisma.payments.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'desc' },
      select: { id: true, razorpay_order_id: true, razorpay_payment_id: true, amount_paise: true, currency: true, status: true, tier_purchased: true, created_at: true }
    });
    res.json({ data: payments });
  } catch (err) { next(err); }
}
