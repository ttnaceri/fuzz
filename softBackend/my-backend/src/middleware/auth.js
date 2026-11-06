// src/middleware/auth.js
import { verifyToken } from '../utils/jwt.js';

const ADMIN_ROLES = ['admin', 'super_admin'];
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

// Bearer tokendan foydalanuvchini aniqlaydi. Rol har doim bazadan olinadi —
// ban yoki rol o'zgarishi darhol kuchga kiradi (tokendagi eski rolga ishonmaymiz).
export async function getAuthUser(c) {
  if (c.get('authUser') !== undefined) return c.get('authUser');
  let user = null;
  const header = c.req.header('Authorization') || '';
  if (header.startsWith('Bearer ')) {
    const payload = await verifyToken(header.slice(7), c.env);
    if (payload?.sub) {
      const row = await c.env.DB.prepare('SELECT id, username, role, balance, telegram_id FROM users WHERE id = ?')
        .bind(payload.sub).first();
      if (row && row.role !== 'banned') user = row;
    }
  }
  c.set('authUser', user);
  return user;
}

export const requireAuth = async (c, next) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avval tizimga kiring', code: 'AUTH_REQUIRED' }, 401);
  await next();
};

export const requireAdmin = async (c, next) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avval tizimga kiring', code: 'AUTH_REQUIRED' }, 401);
  if (!isAdminRole(user.role)) return c.json({ error: 'Ruxsat yo\'q: faqat admin', code: 'FORBIDDEN' }, 403);
  await next();
};

// /users/:userId/... — faqat o'zi yoki admin
export const requireSelfOrAdmin = (param) => async (c, next) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avval tizimga kiring', code: 'AUTH_REQUIRED' }, 401);
  if (user.id !== c.req.param(param) && !isAdminRole(user.role)) {
    return c.json({ error: 'Ruxsat yo\'q', code: 'FORBIDDEN' }, 403);
  }
  await next();
};
