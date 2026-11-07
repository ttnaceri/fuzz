// softBackend/my-backend/src/middleware/auth.js
import { verifyToken } from '../utils/jwt.js';

export async function getAuthUser(c) {
  try {
    const header = c.req.header('Authorization') || '';
    if (!header.startsWith('Bearer ')) return null;
    const token = header.slice(7).trim();
    if (!token) return null;

    const payload = await verifyToken(token, c.env);
    if (!payload?.sub) return null;

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first();
    if (!user) return null;
    if (user.role === 'banned') return null;
    return user;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(c, next) {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Avtorizatsiya kerak' }, 401);
  c.set('user', user);
  await next();
}

export function isAdminRole(role) {
  return role === 'admin' || role === 'super_admin';
}

export async function requireAdmin(c, next) {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Admin ruxsati kerak' }, 401);
  if (!isAdminRole(user.role)) return c.json({ error: 'Ruxsat yo\'q' }, 403);
  c.set('user', user);
  await next();
}

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