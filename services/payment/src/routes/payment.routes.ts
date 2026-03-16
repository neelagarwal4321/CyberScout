import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { createOrder, handleWebhook, getHistory } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), (req: Request, _res: Response, next: NextFunction) => {
  (req as any).rawBody = req.body; next();
}, handleWebhook);

router.use(authMiddleware);
router.post('/order', createOrder);
router.get('/history', getHistory);

export default router;
