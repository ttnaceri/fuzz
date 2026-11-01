// src/middleware/auth.js
import { verifyToken } from '../utils/jwt';

export const requireAuth = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Token missing' }, 401);
  }
  
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token, c.env);
  
  if (!payload) {
    return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
  }
  
  // Foydalanuvchi ma'lumotlarini keyingi qatlamlar uchun saqlaymiz
  c.set('user', payload);
  await next();
};

export const requireAdmin = async (c, next) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};