// softBackend/my-backend/src/middleware/auth.js
//
// Autentifikatsiya va avtorizatsiya middleware.
// `utils/jwt.js` bilan birgalikda ishlaydi.
//
// MUHIM: verifyToken(c.env) — env uzatiladi, c emas.

import { verifyToken } from '../utils/jwt.js';

/**
 * JWT'ni "Authorization: Bearer <token>" dan o'qib, foydalanuvchini qaytaradi.
 * Topilmasa yoki yaroqsiz bo'lsa — null.
 */
export async function getAuthUser(c) {
  try {
    const header = c.req.header('Authorization') || '';
    if (!header.startsWith('Bearer ')) return null;

    const token = header.slice(7).trim();
    if (!token) return null;

    let payload;
    try {
      payload = await verifyToken(token, c.env);
    } catch (e) {
      // Token yaroqsiz — bu normal holat, console'ga yozmaymiz
      return null;
    }

    if (!payload?.sub) return null;

    const user = await c.env.DB.prepare(
      'SELECT id, username, email, role, balance, telegram_id, language, created_at FROM users WHERE id = ?'
    ).bind(payload.sub).first();

    if (!user) return null;
    if (user.role === 'banned') return null;

    return user;
  } catch (e) {
    console.error('[auth] getAuthUser xatosi:', e?.message || e);
    return null;
  }
}

export function isAdminRole(role) {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Avtorizatsiya talab qiladi. Foydalanuvchi `c.get('user')` ga saqlanadi.
 */
export async function requireAuth(c, next) {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avtorizatsiya kerak' }, 401);
  c.set('user', user);
  await next();
}

/**
 * Faqat admin uchun.
 */
export async function requireAdmin(c, next) {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avtorizatsiya kerak' }, 401);
  if (!isAdminRole(user.role)) return c.json({ error: 'Admin ruxsati kerak' }, 403);
  c.set('user', user);
  await next();
}

/**
 * Foydalanuvchi o'zi yoki admin bo'lishi shart.
 * Misol: userApp.use('/users/:userId/*', requireSelfOrAdmin('userId'))
 */
export function requireSelfOrAdmin(paramName = 'userId') {
  return async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: 'Avtorizatsiya kerak' }, 401);
    const paramId = c.req.param(paramName);
    if (user.id !== paramId && !isAdminRole(user.role)) {
      return c.json({ error: 'Ruxsat yo\'q' }, 403);
    }
    c.set('user', user);
    await next();
  };
}