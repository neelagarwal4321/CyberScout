import { Router } from 'express';
import { getMe, patchMe, getSubscription } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/me', getMe);
router.patch('/me', patchMe);
router.get('/me/subscription', getSubscription);

export default router;
