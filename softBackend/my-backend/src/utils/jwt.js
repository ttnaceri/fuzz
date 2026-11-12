// softBackend/my-backend/src/utils/jwt.js
import { sign, verify } from 'hono/jwt';

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 kun

const TTL_MAP = {
  '5m': 5 * 60,
  '1h': 60 * 60,
  '24h': 60 * 60 * 24,
  '30d': 60 * 60 * 24 * 30,
};

export async function createToken(payload, env, expiresIn = '30d') {
  const secret = env?.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET sozlanmagan');

  const ttl = TTL_MAP[expiresIn] || DEFAULT_TTL_SECONDS;
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttl };
  return await sign(body, secret);
}

export async function verifyToken(token, env) {
  const secret = env?.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET sozlanmagan');
  return await verify(token, secret, 'HS256');
}