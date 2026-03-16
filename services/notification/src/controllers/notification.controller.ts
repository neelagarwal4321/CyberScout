import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const notifs = await prisma.notifications.findMany({
      where: { user_id: req.user!.id }, orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit, take: limit,
    });
    res.json({ data: notifs });
  } catch (err) { next(err); }
}
export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notifications.updateMany({ where: { id: req.params.id, user_id: req.user!.id }, data: { is_read: true } });
    res.json({ data: { updated: true } });
  } catch (err) { next(err); }
}
