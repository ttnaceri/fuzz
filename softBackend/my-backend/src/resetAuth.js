// softBackend/my-backend/src/resetAuth.js
// Parolni tiklash: username/email/telegram_id → kod → yangi parol
// 5 daqiqa TTL, 5 xonali kod, attempts limiting, reset_token.

import { Hono } from 'hono';
import { hashPassword } from './utils/password.js';

const CODE_TTL_MS = 5 * 60 * 1000;    // 5 daqiqa
const CODE_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 daqiqa
const MIN_PASSWORD = 6;

function randomCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
  return n.toString().padStart(5, '0');
}

function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export async function ensureResetTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS reset_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT,
      email TEXT,
      telegram_id TEXT,
      code TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      reset_token TEXT,
      reset_expires_at INTEGER,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `).run();
  try { await db.prepare('ALTER TABLE reset_codes ADD COLUMN reset_token TEXT').run(); } catch {}
  try { await db.prepare('ALTER TABLE reset_codes ADD COLUMN reset_expires_at INTEGER').run(); } catch {}
}

async function sendBotMessage(botToken, chatId, text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    return await res.json();
  } catch (e) { return { ok: false, error: e.message }; }
}

const app = new Hono();

// 1) Boshlash: kamida 2 ta identifikator
app.post('/auth/reset/start', async (c) => {
  try {
    await ensureResetTable(c.env.DB);
    const { username, email, telegramId } = await c.req.json();
    const provided = [
      { k: 'username', v: (username || '').trim() },
      { k: 'email', v: (email || '').trim() },
      { k: 'telegram_id', v: (telegramId || '').trim() },
    ].filter((x) => x.v);

    if (provided.length < 2) return c.json({ error: 'Kamida 2 ta maydon kerak (username/email/telegram_id)' }, 400);

    const where = provided.map((x) => `${x.k} = ?`).join(' AND ');
    const user = await c.env.DB.prepare(`SELECT * FROM users WHERE ${where}`)
      .bind(...provided.map((x) => x.v)).first();
    if (!user) return c.json({ error: 'Foydalanuvchi topilmadi yoki ma\'lumotlar mos emas' }, 404);
    if (!user.telegram_id) return c.json({ error: 'Akkauntga Telegram ulanmagan' }, 400);

    // Rate limit: 60 sek
    const last = await c.env.DB.prepare('SELECT created_at FROM reset_codes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').bind(user.id).first();
    if (last && Date.now() - last.created_at < 60 * 1000) {
      return c.json({ error: 'Kod yaqinda yuborildi. 1 daqiqadan keyin urinib ko\'ring.' }, 429);
    }

    const code = randomCode();
    const now = Date.now();
    const expiresAt = now + CODE_TTL_MS;

    await c.env.DB.prepare('DELETE FROM reset_codes WHERE user_id = ?').bind(user.id).run();
    await c.env.DB.prepare(`
      INSERT INTO reset_codes (id, user_id, username, email, telegram_id, code, attempts, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(crypto.randomUUID(), user.id, user.username, user.email, user.telegram_id, code, expiresAt, now).run();

    const msg = await sendBotMessage(
      c.env.BOT_TOKEN, user.telegram_id,
      `🔐 *Fuzz parolni tiklash kodi*\n\n\`${code}\`\n\nKod 5 daqiqa amal qiladi.`
    );
    if (!msg.ok) return c.json({ error: 'Kod yuborilmadi. Bot bilan bog\'lanishni tekshiring.' }, 502);

    return c.json({ message: 'Kod yuborildi', ttlMs: CODE_TTL_MS });
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

// 2) Kodni tekshirish → reset_token
app.post('/auth/reset/verify', async (c) => {
  try {
    const { username, code } = await c.req.json();
    if (!username || !code) return c.json({ error: 'username va code kerak' }, 400);

    const user = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (!user) return c.json({ error: 'Foydalanuvchi topilmadi' }, 404);

    const row = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').bind(user.id).first();
    if (!row) return c.json({ error: 'Kod so\'ralmagan' }, 400);
    if (row.expires_at < Date.now()) return c.json({ error: 'Kod muddati o\'tgan' }, 400);
    if ((row.attempts || 0) >= CODE_MAX_ATTEMPTS) return c.json({ error: 'Urinishlar tugadi. Yangi kod so\'rang.' }, 429);

    if (String(code) !== row.code) {
      await c.env.DB.prepare('UPDATE reset_codes SET attempts = COALESCE(attempts, 0) + 1 WHERE id = ?').bind(row.id).run();
      return c.json({ error: 'Kod xato' }, 400);
    }

    const resetToken = randomToken();
    const resetExp = Date.now() + RESET_TOKEN_TTL_MS;
    await c.env.DB.prepare('UPDATE reset_codes SET reset_token = ?, reset_expires_at = ? WHERE id = ?')
      .bind(resetToken, resetExp, row.id).run();

    return c.json({ ok: true, resetToken, ttlMs: RESET_TOKEN_TTL_MS });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

// 3) Yangi parol
app.post('/auth/reset/complete', async (c) => {
  try {
    const { resetToken, newPassword } = await c.req.json();
    if (!resetToken || !newPassword) return c.json({ error: 'resetToken va newPassword kerak' }, 400);
    if (newPassword.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi` }, 400);

    const row = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE reset_token = ?').bind(resetToken).first();
    if (!row) return c.json({ error: 'Tiklash tokeni xato' }, 400);
    if (!row.reset_expires_at || row.reset_expires_at < Date.now()) return c.json({ error: 'Tiklash tokeni muddati o\'tgan' }, 400);

    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(await hashPassword(newPassword), row.user_id),
      c.env.DB.prepare('DELETE FROM reset_codes WHERE id = ?').bind(row.id),
    ]);

    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

export default app;