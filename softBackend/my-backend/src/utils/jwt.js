// src/utils/jwt.js
import { SignJWT, jwtVerify } from 'jose';

// Zaxira (fallback) sirni ishlatmaymiz: u ochiq repoda bo'lgani uchun istalgan odam
// admin tokenini soxtalashtira olardi. JWT_SECRET yo'q bo'lsa — xato.
const getSecret = (env) => {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET sozlanmagan (kamida 32 belgi): npx wrangler secret put JWT_SECRET');
  }
  return new TextEncoder().encode(env.JWT_SECRET);
};

export async function createToken(payload, env) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret(env));
}

export async function verifyToken(token, env) {
  try {
    const { payload } = await jwtVerify(token, getSecret(env), { algorithms: ['HS256'] });
    return payload;
  } catch (e) {
    return null;
  }
}
