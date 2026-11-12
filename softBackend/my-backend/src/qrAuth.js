// softBackend/my-backend/src/qrAuth.js
import { Hono } from 'hono';
import { createToken } from './utils/jwt.js';
import { getAuthUser } from './middleware/auth.js';

const QR_TTL_MS = 2 * 60 * 1000;
const TOKEN_RE = /^[a-f0-9]{64}$/;

const round2 = (num) => Math.round(Number(num) * 100) / 100;
const publicUser = (u) => ({ id: u.id, username: u.username, role: u.role, balance: round2(u.balance || 0) });

const MODES = ['my_device', 'fuzz_client', 'guest', 'single_use'];

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function random2Digit() {
  const n = 10 + (crypto.getRandomValues(new Uint32Array(1))[0] % 90);
  return n.toString();
}

// Muddat hisoblash (sekundda)
function computeTtlSeconds(mode, guestHours) {
  switch (mode) {
    case 'my_device':   return 60 * 60 * 24 * 365 * 10; // 10 yil
    case 'fuzz_client': return 60 * 60 * 24 * 365 * 10; // 10 yil
    case 'guest': {
      const hours = Math.max(1, Math.min(72, Number(guestHours) || 1));
      return hours * 60 * 60;
    }
    case 'single_use':  return 5 * 60; // 5 daqiqa
    default:            return 60 * 60 * 24 * 365 * 10;
  }
}

export async function ensureQrTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS qr_sessions (
      token TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      user_id TEXT,
      user_agent TEXT,
      mode TEXT DEFAULT 'my_device',
      guest_hours INTEGER DEFAULT 1,
      code TEXT,
      code_expires_at INTEGER,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `).run();
  try { await db.prepare("ALTER TABLE qr_sessions ADD COLUMN mode TEXT DEFAULT 'my_device'").run(); } catch {}
  try { await db.prepare("ALTER TABLE qr_sessions ADD COLUMN guest_hours INTEGER DEFAULT 1").run(); } catch {}
  try { await db.prepare("ALTER TABLE qr_sessions ADD COLUMN code TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE qr_sessions ADD COLUMN code_expires_at INTEGER").run(); } catch {}
}

async function sendBotCode(botToken, chatId, code) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔐 *Fuzz QR tasdiqlash kodi*\n\n\`${code}\`\n\nKod 1 daqiqa amal qiladi. Bu kodni hech kimga bermang.`,
        parse_mode: 'Markdown',
      }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const qrApp = new Hono();

qrApp.use('/auth/qr/*', async (c, next) => {
  if (!c.env.JWT_SECRET) {
    return c.json({ error: "QR login sozlanmagan (JWT_SECRET yo'q)" }, 503);
  }
  try {
    await ensureQrTable(c.env.DB);
  } catch (e) {
    return c.json({ error: 'QR jadval xatosi', detail: String(e?.message || e) }, 500);
  }
  await next();
});

qrApp.post('/auth/qr/create', async (c) => {
  try {
    const now = Date.now();
    try {
      await c.env.DB.prepare('DELETE FROM qr_sessions WHERE expires_at < ?').bind(now - QR_TTL_MS).run();
    } catch (e) { /* ignore */ }

    const token = randomToken();
    const expiresAt = now + QR_TTL_MS;
    const ua = (c.req.header('User-Agent') || '').slice(0, 200);

    await c.env.DB.prepare(
      'INSERT INTO qr_sessions (token, status, user_agent, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(token, 'pending', ua, now, expiresAt).run();

    return c.json({ token, expiresAt, ttlMs: QR_TTL_MS });
  } catch (err) {
    return c.json({ error: 'QR yaratishda xato', detail: String(err?.message || err) }, 500);
  }
});

qrApp.get('/auth/qr/status', async (c) => {
  try {
    const token = c.req.query('token') || '';
    if (!TOKEN_RE.test(token)) return c.json({ error: "Noto'g'ri token" }, 400);

    const now = Date.now();
    const consumed = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = 'consumed' WHERE token = ? AND status = 'approved' AND expires_at > ? RETURNING user_id, mode, guest_hours"
    ).bind(token, now).first();

    if (consumed?.user_id) {
      const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(consumed.user_id).first();
      if (!user || user.role === 'banned') return c.json({ status: 'expired' });

      const ttl = computeTtlSeconds(consumed.mode, consumed.guest_hours);
      const jwt = await createToken({ sub: user.id }, c.env, ttl);
      return c.json({
        status: 'approved',
        user: publicUser(user),
        token: jwt,
        mode: consumed.mode,
        ttlSeconds: ttl,
      });
    }

    const row = await c.env.DB.prepare('SELECT status, expires_at FROM qr_sessions WHERE token = ?').bind(token).first();
    if (!row || row.status === 'consumed' || row.expires_at <= now) return c.json({ status: 'expired' });
    return c.json({ status: row.status });
  } catch (err) {
    return c.json({ error: 'Status xatosi', detail: String(err?.message || err) }, 500);
  }
});

// ==========================================
// APPROVE — My Device uchun kod yuborish
// ==========================================
qrApp.post('/auth/qr/approve', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: 'Tizimga kiring', code: 'AUTH_REQUIRED' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const { token, mode, guestHours } = body;

    if (!TOKEN_RE.test(token || '')) return c.json({ error: "Noto'g'ri QR kod" }, 400);
    if (!MODES.includes(mode)) return c.json({ error: "Noto'g'ri rejim" }, 400);

    // My Device uchun 2 xonali kod yuboramiz
    if (mode === 'my_device') {
      if (!user.telegram_id) {
        return c.json({ error: 'Telegram ulanmagan. Avval Telegram ID ni sozlang.' }, 400);
      }

      const code = random2Digit();
      const codeExpiresAt = Date.now() + 60 * 1000; // 1 daqiqa

      const res = await c.env.DB.prepare(
        "UPDATE qr_sessions SET status = 'pending_code', user_id = ?, mode = ?, code = ?, code_expires_at = ? WHERE token = ? AND status = 'pending' AND expires_at > ?"
      ).bind(user.id, mode, code, codeExpiresAt, token, Date.now()).run();

      if (!res.meta?.changes) return c.json({ error: 'QR eskirgan', code: 'QR_EXPIRED' }, 410);

      const msg = await sendBotCode(c.env.BOT_TOKEN, user.telegram_id, code);
      if (!msg.ok) {
        return c.json({ error: 'Kod yuborilmadi. Bot bilan bog\'lanishni tekshiring.' }, 502);
      }

      return c.json({ ok: true, requiresCode: true, message: 'Kod Telegramingizga yuborildi' });
    }

    // Boshqa rejimlar — darhol tasdiqlash
    const hours = mode === 'guest' ? Math.max(1, Math.min(72, Number(guestHours) || 1)) : 1;

    const res = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = 'approved', user_id = ?, mode = ?, guest_hours = ? WHERE token = ? AND status = 'pending' AND expires_at > ?"
    ).bind(user.id, mode, hours, token, Date.now()).run();

    if (!res.meta?.changes) return c.json({ error: 'QR eskirgan', code: 'QR_EXPIRED' }, 410);

    return c.json({ ok: true, requiresCode: false, mode });
  } catch (err) {
    return c.json({ error: 'Tasdiqlash xatosi', detail: String(err?.message || err) }, 500);
  }
});

// ==========================================
// VERIFY CODE — My Device uchun kodni tekshirish
// ==========================================
qrApp.post('/auth/qr/verify-code', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: 'Tizimga kiring', code: 'AUTH_REQUIRED' }, 401);

    const { token, code } = await c.req.json().catch(() => ({}));
    if (!TOKEN_RE.test(token || '')) return c.json({ error: "Noto'g'ri QR kod" }, 400);
    if (!/^\d{2}$/.test(String(code || ''))) return c.json({ error: 'Kod 2 xonali bo\'lishi kerak' }, 400);

    const row = await c.env.DB.prepare(
      "SELECT * FROM qr_sessions WHERE token = ? AND status = 'pending_code' AND user_id = ?"
    ).bind(token, user.id).first();

    if (!row) return c.json({ error: 'QR topilmadi yoki allaqachon tasdiqlangan' }, 404);
    if (!row.code_expires_at || row.code_expires_at < Date.now()) {
      return c.json({ error: 'Kod muddati o\'tgan. Qaytadan urinib ko\'ring.' }, 400);
    }
    if (String(code) !== row.code) {
      return c.json({ error: 'Kod xato' }, 400);
    }

    const res = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = 'approved', code = NULL, code_expires_at = NULL WHERE token = ? AND status = 'pending_code'"
    ).bind(token).run();

    if (!res.meta?.changes) return c.json({ error: 'Xato' }, 500);

    return c.json({ ok: true, status: 'approved', mode: row.mode });
  } catch (err) {
    return c.json({ error: 'Kod tekshirishda xato', detail: String(err?.message || err) }, 500);
  }
});

// ==========================================
// REJECT
// ==========================================
qrApp.post('/auth/qr/reject', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) return c.json({ error: 'Tizimga kiring', code: 'AUTH_REQUIRED' }, 401);

    const { token } = await c.req.json().catch(() => ({}));
    if (!TOKEN_RE.test(token || '')) return c.json({ error: "Noto'g'ri QR kod" }, 400);

    const res = await c.env.DB.prepare(
      "UPDATE qr_sessions SET status = 'rejected', user_id = ? WHERE token = ? AND status IN ('pending', 'pending_code') AND expires_at > ?"
    ).bind(user.id, token, Date.now()).run();

    if (!res.meta?.changes) return c.json({ error: 'QR eskirgan', code: 'QR_EXPIRED' }, 410);
    return c.json({ ok: true, status: 'rejected' });
  } catch (err) {
    return c.json({ error: 'Rad etish xatosi', detail: String(err?.message || err) }, 500);
  }
});

export default qrApp;