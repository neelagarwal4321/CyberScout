import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const PRIVATE_KEY = readFileSync(process.env.JWT_PRIVATE_KEY_FILE!, 'utf-8');
const PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_FILE!, 'utf-8');

export interface JWTPayload {
  sub: string;
  email: string;
  tier: string;
  jti: string;
  iat: number;
  exp: number;
}

export function signAccessToken(user: { id: string; email: string; tier: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, tier: user.tier },
    PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m', jwtid: crypto.randomUUID() }
  );
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as JWTPayload;
}
