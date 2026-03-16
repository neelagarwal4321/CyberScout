import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { exchangeCodeForTokens, verifyAndDecodeIdToken } from '../services/google.service';
import { signAccessToken } from '../services/jwt.service';
import { generateRefreshToken, hashToken, storeRefreshToken, rotateTokens, revokeToken } from '../services/token.service';
import { getRedis } from '../utils/redis';
import { publishEvent } from '../events/publisher';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, code_verifier } = req.body;
    const tokens = await exchangeCodeForTokens(code, code_verifier);
    const userInfo = await verifyAndDecodeIdToken(tokens.id_token);

    const isNew = !(await prisma.users.findUnique({ where: { google_id: userInfo.sub } }));

    const user = await prisma.users.upsert({
      where: { google_id: userInfo.sub },
      create: {
        google_id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        avatar_url: userInfo.picture,
        tier: 'free',
      },
      update: {
        last_login_at: new Date(),
        name: userInfo.name,
        avatar_url: userInfo.picture,
      },
    });

    // Load tier from Redis or DB
    let tier = await getRedis().get(`perm:${user.id}`);
    if (!tier) {
      const sub = await prisma.subscriptions.findUnique({ where: { user_id: user.id } });
      tier = sub?.tier || user.tier;
      await getRedis().set(`perm:${user.id}`, tier, 'EX', 300);
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, tier });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, refreshToken);

    if (isNew) {
      await publishEvent('stream:user_registered', {
        user_id: user.id, email: user.email, name: user.name, tier: 'free', timestamp: Date.now().toString()
      });
    }

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ data: { access_token: accessToken, user: { id: user.id, email: user.email, name: user.name, tier, avatar_url: user.avatar_url } } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const oldToken = req.cookies?.refresh_token;
    if (!oldToken) throw new AppError('REFRESH_TOKEN_MISSING', 401);

    const { accessToken, refreshToken } = await rotateTokens(oldToken);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ data: { access_token: accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await revokeToken(req.user!.jti, hashToken(refreshToken));
    }
    res.clearCookie('refresh_token');
    res.json({ data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}
