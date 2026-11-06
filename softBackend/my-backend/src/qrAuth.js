// QR orqali kirish (desktop QR ko'rsatadi, tizimga kirgan telefon tasdiqlaydi)
//
// Oqim:
//   1. Desktop:  POST /auth/qr/create          -> { token, expiresAt }
//   2. Desktop:  GET  /auth/qr/status?token=   -> har 2s so'raydi (pending | approved | expired | rejected)
//   3. Telefon:  POST /auth/qr/approve {token} -> Authorization: Bearer <JWT> kerak
//   4. Desktop:  status "approved" ni BIR MARTA oladi (sessiya "consumed" bo'ladi) + user + JWT
import { Hono } from 'hono';
import { createToken } from './utils/jwt.js';
import { getAuthUser } from './middleware/auth.js';

const QR_TTL_MS = 2 * 60 * 1000; // 2 daqiqa
const TOKEN_RE = /^[a-f0-9]{64}$/;

const round2 = (num) => Math.round(Number(num) * 100) / 100;
const publicUser = (u) => ({ id: u.id, username: u.username, role: u.role, balance: round2(u.balance || 0) });

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function ensureQrTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS qr_sessions (
      token TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      user_id TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `).run();
}

const qrApp = new Hono();

// JWT_SECRET o'rnatilmagan bo'lsa, tokenni istalgan odam soxtalashtira oladi —
// bu holda QR orqali kirish o'chiriladi.
qrApp.use('/auth/qr/*', async (c, next) => {
  if (!c.env.JWT_SECRET) {
    return c.json({ error: "QR orqali kirish sozlanmagan (JWT_SECRET yo'q)" }, 503);
  }
  await ensureQrTable(c.env.DB);
  await next();
});

qrApp.post('/auth/qr/create', async (c) => {
  try {
    const now = Date.now();
    // Eski sessiyalarni tozalash
    await c.env.DB.prepare('DELETE FROM qr_sessions WHERE expires_at < ?').bind(now - QR_TTL_MS).run();

    const token = randomToken();
    const expiresAt = now + QR_TTL_MS;
    const ua = (c.req.header('User-Agent') || '').slice(0, 200);
    await c.env.DB.prepare(
      'INSERT INTO qr_sessions (token, status, user_agent, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(token, 'pending', ua, now, expiresAt).run();

    return c.json({ token, expiresAt, ttlMs: QR_TTL_MS });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

qrApp.get('/auth/qr/status', async (c) => {
  try {
    const token = c.req.query('token') || '';
    if (!TOKEN_RE.test(token)) return c.json({ error: "Noto'g'ri token" }, 400);

    const now = Date.now();
    // Tasdiqlangan sessiyani atomik ravishda "consumed" qilamiz — login faqat bir marta beriladi
    const consumed = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = 'consumed' WHERE token = ? AND status = 'approved' AND expires_at > ? RETURNING user_id"
    ).bind(token, now).first();

    if (consumed?.user_id) {
      const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(consumed.user_id).first();
      if (!user || user.role === 'banned') return c.json({ status: 'expired' });
      const jwt = await createToken({ sub: user.id }, c.env);
      return c.json({ status: 'approved', user: publicUser(user), token: jwt });
    }

    const row = await c.env.DB.prepare('SELECT status, expires_at FROM qr_sessions WHERE token = ?').bind(token).first();
    if (!row || row.status === 'consumed' || row.expires_at <= now) return c.json({ status: 'expired' });
    return c.json({ status: row.status }); // pending | rejected
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

async function decide(c, newStatus) {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: 'Avval telefonda qaytadan tizimga kiring', code: 'AUTH_REQUIRED' }, 401);

    const { token } = await c.req.json().catch(() => ({}));
    if (!TOKEN_RE.test(token || '')) return c.json({ error: "Noto'g'ri QR kod" }, 400);

    const res = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = ?, user_id = ? WHERE token = ? AND status = 'pending' AND expires_at > ?"
    ).bind(newStatus, user.id, token, Date.now()).run();

    if (!res.meta?.changes) {
      return c.json({ error: "QR kod eskirgan yoki allaqachon ishlatilgan. Kompyuterda yangisini oching.", code: 'QR_EXPIRED' }, 410);
    }
    return c.json({ ok: true, status: newStatus });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
}

qrApp.post('/auth/qr/approve', (c) => decide(c, 'approved'));
qrApp.post('/auth/qr/reject', (c) => decide(c, 'rejected'));

export default qrApp;
