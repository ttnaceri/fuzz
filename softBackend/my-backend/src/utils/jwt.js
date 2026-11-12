// softBackend/my-backend/src/utils/jwt.js
import { sign, verify } from 'hono/jwt';

// 10 yil — "cheksiz" sessiya uchun
const FOREVER_SECONDS = 60 * 60 * 24 * 365 * 10;

export async function createToken(payload, env, ttlSeconds = FOREVER_SECONDS) {
  const secret = env?.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET sozlanmagan');

  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(ttlSeconds) > 0 ? Number(ttlSeconds) : FOREVER_SECONDS;
  const body = { ...payload, iat: now, exp: now + ttl };
  return await sign(body, secret);
}

export async function verifyToken(token, env) {
  const secret = env?.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET sozlanmagan');
  return await verify(token, secret, 'HS256');
}