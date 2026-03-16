import { Router, Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { googleCallback, refresh, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';
import { AppError } from '../middleware/error';
import { googleCallbackSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();

function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body, cookies: req.cookies });
    if (!result.success) {
      const details = result.error.flatten();
      return next(new AppError('VALIDATION_ERROR', 400, details));
    }
    next();
  };
}

router.post('/google/callback', rateLimit(20, 60), validate(googleCallbackSchema), googleCallback);
router.post('/refresh', rateLimit(30, 60), validate(refreshSchema), refresh);
router.post('/logout', authMiddleware, logout);

export default router;
