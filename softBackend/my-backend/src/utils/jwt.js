// src/utils/jwt.js
import { SignJWT, jwtVerify } from 'jose';

const getSecret = (env) => new TextEncoder().encode(env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function createToken(payload, env) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 1 kunlik token
    .sign(getSecret(env));
}

export async function verifyToken(token, env) {
  try {
    const { payload } = await jwtVerify(token, getSecret(env));
    return payload;
  } catch (e) {
    return null;
  }
}