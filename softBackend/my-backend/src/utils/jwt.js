// softBackend/my-backend/src/utils/jwt.js
import { sign, verify } from 'hono/jwt';

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 kun

export async function createToken(payload, env) {
  const secret = env?.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET sozlanmagan');
  }
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + DEFAULT_TTL_SECONDS,
  };
  return await sign(body, secret);
}

export async function verifyToken(token, env) {
  const secret = env?.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET sozlanmagan');
  return await verify(token, secret);
}