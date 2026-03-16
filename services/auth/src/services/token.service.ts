import crypto from 'crypto';
import { getRedis } from '../utils/redis';
import { PrismaClient } from '@prisma/client';
import { signAccessToken } from './jwt.service';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const hash = hashToken(token);
  await getRedis().set(`refresh_token:${hash}`, userId, 'EX', 604800);
}

export async function rotateTokens(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const redis = getRedis();
  const oldHash = hashToken(oldToken);
  const userId = await redis.get(`refresh_token:${oldHash}`);
  if (!userId) throw new AppError('REFRESH_TOKEN_EXPIRED', 401);

  await redis.del(`refresh_token:${oldHash}`);

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('USER_NOT_FOUND', 404);

  const accessToken = signAccessToken({ id: user.id, email: user.email, tier: user.tier });
  const newRefresh = generateRefreshToken();
  await storeRefreshToken(userId, newRefresh);

  return { accessToken, refreshToken: newRefresh };
}

export async function revokeToken(jti: string, refreshTokenHash: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`jti_block:${jti}`, '1', 'EX', 900);
  await redis.del(`refresh_token:${refreshTokenHash}`);
}
