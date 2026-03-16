import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';
const prisma = new PrismaClient();

function generateZoomSDKJWT(meetingNumber: string, role: number = 0): string {
  return jwt.sign({
    sdkKey: process.env.ZOOM_SDK_KEY, mn: meetingNumber, role,
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 1800,
    tokenExp: Math.floor(Date.now() / 1000) + 1800,
  }, process.env.ZOOM_SDK_SECRET!, { algorithm: 'HS256' });
}

export async function listClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const classes = await prisma.live_classes.findMany({
      where: { is_published: true },
      orderBy: { starts_at: 'asc' },
      take: 20,
    });
    res.json({ data: classes });
  } catch (err) { next(err); }
}

export async function joinClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const liveClass = await prisma.live_classes.findUnique({ where: { id: req.params.id } });
    if (!liveClass) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Class not found' } }); return; }
    const tierRank: Record<string, number> = { free: 0, beginner: 1, intermediate: 2, pro: 3 };
    if (tierRank[req.user!.tier] < tierRank[liveClass.tier_required]) {
      res.status(403).json({ error: { code: 'TIER_INSUFFICIENT', message: 'Upgrade to join', upgrade_url: '/pricing' } }); return;
    }
    const sdkToken = generateZoomSDKJWT(liveClass.zoom_meeting_id);
    res.json({ data: { sdk_token: sdkToken, meeting_id: liveClass.zoom_meeting_id, join_url: liveClass.zoom_join_url, password: liveClass.zoom_password } });
  } catch (err) { next(err); }
}

export async function registerClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.class_registrations.upsert({
      where: { user_id_class_id: { user_id: req.user!.id, class_id: req.params.id } },
      create: { user_id: req.user!.id, class_id: req.params.id },
      update: {},
    });
    res.json({ data: { registered: true } });
  } catch (err) { next(err); }
}

export async function handleZoomWebhook(req: Request, res: Response): Promise<void> {
  const redis = getRedis();
  const event = req.body;

  if (event.event === 'meeting.participant_joined') {
    const p = event.payload?.object?.participant;
    if (p) {
      await prisma.zoom_sessions.create({
        data: { user_id: p.user_id || p.id, class_id: event.payload.object.id, zoom_participant_id: p.participant_user_id, joined_at: new Date(p.join_time) }
      }).catch(() => {});
    }
  }

  if (event.event === 'meeting.participant_left') {
    const p = event.payload?.object?.participant;
    if (p) {
      const session = await prisma.zoom_sessions.findFirst({ where: { zoom_participant_id: p.participant_user_id } });
      if (session && session.joined_at) {
        const durationMins = Math.floor((Date.now() - session.joined_at.getTime()) / 60000);
        const valid = durationMins >= 15;
        await prisma.zoom_sessions.update({ where: { id: session.id }, data: { left_at: new Date(), duration_mins: durationMins, attendance_valid: valid, xp_earned: valid ? 75 : 0 } });
        if (valid) {
          await redis.xadd('stream:class_attended', '*', 'user_id', session.user_id, 'class_id', session.class_id, 'duration_mins', durationMins.toString());
        }
      }
    }
  }
  res.json({ status: 'ok' });
}
