import { Router } from 'express';
import { getLeaderboard, getMe } from '../controllers/gamification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/leaderboard', getLeaderboard);
router.get('/me', getMe);

export default router;
