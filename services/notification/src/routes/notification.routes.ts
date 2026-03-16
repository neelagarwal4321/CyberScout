import { Router } from 'express';
import { getNotifications, markRead } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();
router.use(authMiddleware);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);
export default router;
