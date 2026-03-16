import { createPublicKey, createVerify } from 'crypto';
import { getRedis } from '../utils/redis';
import { AppError } from '../middleware/error';

interface GoogleTokenResponse {
  id_token: string;
  access_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface JWK {
  kid: string;
  kty: string;
  alg: string;
  n: string;
  e: string;
  [key: string]: unknown;
}

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const JWKS_CACHE_KEY = 'jwks:google';
const JWKS_TTL_SECS = 86400; // 24 hours

async function fetchGoogleJWKS(): Promise<JWK[]> {
  const cached = await getRedis().get(JWKS_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const res = await fetch(GOOGLE_JWKS_URL);
  if (!res.ok) throw new AppError('JWKS_FETCH_FAILED', 502);

  const { keys } = await res.json() as { keys: JWK[] };
  await getRedis().set(JWKS_CACHE_KEY, JSON.stringify(keys), 'EX', JWKS_TTL_SECS);
  return keys;
}

export async function exchangeCodeForTokens(code: string, codeVerifier?: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: 'authorization_code',
    ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new AppError('GOOGLE_TOKEN_EXCHANGE_FAILED', 502, err);
  }

  return response.json();
}

export async function verifyAndDecodeIdToken(idToken: string): Promise<GoogleUserInfo> {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new AppError('INVALID_ID_TOKEN', 401);

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

  // Validate standard claims
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new AppError('ID_TOKEN_EXPIRED', 401);
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(payload.iss)) {
    throw new AppError('INVALID_TOKEN_ISSUER', 401);
  }
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new AppError('INVALID_TOKEN_AUDIENCE', 401);
  }

  // Verify signature against Google JWKS
  const keys = await fetchGoogleJWKS();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    // Key might be new — bust cache and retry once
    await getRedis().del(JWKS_CACHE_KEY);
    const freshKeys = await fetchGoogleJWKS();
    const freshJwk = freshKeys.find((k) => k.kid === header.kid);
    if (!freshJwk) throw new AppError('JWKS_KEY_NOT_FOUND', 401);
    return verifySignatureAndExtract(parts, freshJwk, payload);
  }

  return verifySignatureAndExtract(parts, jwk, payload);
}

function verifySignatureAndExtract(parts: string[], jwk: JWK, payload: Record<string, unknown>): GoogleUserInfo {
  const publicKey = createPublicKey({ key: jwk as unknown as Parameters<typeof createPublicKey>[0], format: 'jwk' });
  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = Buffer.from(parts[2], 'base64url');

  const verifier = createVerify('RSA-SHA256');
  verifier.update(signingInput);
  const valid = verifier.verify(publicKey, signature);

  if (!valid) throw new AppError('INVALID_TOKEN_SIGNATURE', 401);

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string,
  };
}
