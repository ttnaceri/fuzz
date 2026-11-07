// softBackend/my-backend/src/registerAuth.js
// Register oqimi: Telegram ID → 2 xonali kod → username/email/parol
// 2 xato urinish → 1 soat blok

import { Hono } from 'hono';
import { createToken } from './utils/jwt.js';
import { hashPassword } from './utils/password.js';

const MIN_PASSWORD = 6;
const CODE_TTL_MS = 5 * 60 * 1000;       // 5 daqiqa (YANGI)
const MAX_ATTEMPTS = 2;                  // 2 marta xato
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 soat blok

function randomCode() {
  // 2 xonali kod: 10..99 (00-09 emas, "nol" bilan boshlanmasin)
  const n = 10 + (crypto.getRandomValues(new Uint32Array(1))[0] % 90);
  return n.toString();
}

export async function ensureRegisterTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS reg_sessions (
      telegram_id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      blocked_until INTEGER DEFAULT 0,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `).run();
}

async function sendBotMessage(botToken, chatId, text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const app = new Hono();

// 1) Kod yuborish
app.post('/auth/register/start', async (c) => {
  try {
    await ensureRegisterTable(c.env.DB);
    const { telegramId } = await c.req.json();
    const tid = String(telegramId || '').trim();
    if (!/^\d{6,15}$/.test(tid)) return c.json({ error: 'Noto\'g\'ri Telegram ID' }, 400);

    // Bu ID allaqachon users'da bormi?
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE telegram_id = ?').bind(tid).first();
    if (existing) return c.json({ error: 'Bu Telegram ID allaqachon ro\'yxatdan o\'tgan' }, 409);

    const now = Date.now();

    // Blok holatini tekshirish
    const prev = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE telegram_id = ?').bind(tid).first();
    if (prev && prev.blocked_until > now) {
      const mins = Math.ceil((prev.blocked_until - now) / 60000);
      return c.json({ error: `Juda ko'p xato. ${mins} daqiqadan keyin urinib ko'ring.` }, 429);
    }

    // Yangi kod
    const code = randomCode();
    const expiresAt = now + CODE_TTL_MS;
    await c.env.DB.prepare(`
      INSERT INTO reg_sessions (telegram_id, code, attempts, blocked_until, expires_at, created_at)
      VALUES (?, ?, 0, 0, ?, ?)
      ON CONFLICT(telegram_id) DO UPDATE SET
        code = excluded.code,
        attempts = 0,
        blocked_until = 0,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at
    `).bind(tid, code, expiresAt, now).run();

    // Botga kod yuborish
    const msg = await sendBotMessage(
      c.env.BOT_TOKEN, tid,
      `🔐 *Fuzz ro'yxatdan o'tish kodi:*\n\n\`${code}\`\n\nKod 10 daqiqa amal qiladi.`
    );
    if (!msg.ok) {
      return c.json({ error: "Botga xabar yuborib bo'lmadi. Avval @FuzzAppBot ga /start bosing." }, 400);
    }

    return c.json({ message: 'Kod yuborildi', ttlMs: CODE_TTL_MS });
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

// 2) Kodni tekshirish
app.post('/auth/register/verify', async (c) => {
  try {
    await ensureRegisterTable(c.env.DB);
    const { telegramId, code } = await c.req.json();
    const tid = String(telegramId || '').trim();
    const cleanCode = String(code || '').trim();

    if (!/^\d{6,15}$/.test(tid)) return c.json({ error: 'Noto\'g\'ri Telegram ID' }, 400);
    if (!/^\d{2}$/.test(cleanCode)) return c.json({ error: 'Kod 2 xonali bo\'lishi kerak' }, 400);

    const now = Date.now();
    const row = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE telegram_id = ?').bind(tid).first();
    if (!row) return c.json({ error: 'Kod so\'ralmagan. Iltimos, qaytadan boshlang.' }, 400);

    // Blok tekshiruvi
    if (row.blocked_until > now) {
      const mins = Math.ceil((row.blocked_until - now) / 60000);
      return c.json({ error: `Juda ko'p xato. ${mins} daqiqadan keyin urinib ko'ring.` }, 429);
    }

    // Muddati
    if (row.expires_at < now) return c.json({ error: 'Kod muddati o\'tgan. Yangi kod so\'rang.' }, 400);

    // Kod mos keldimi?
    if (row.code !== cleanCode) {
      const newAttempts = (row.attempts || 0) + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        await c.env.DB.prepare('UPDATE reg_sessions SET attempts = ?, blocked_until = ? WHERE telegram_id = ?')
          .bind(newAttempts, now + BLOCK_DURATION_MS, tid).run();
        return c.json({ error: 'Kod 2 marta xato kiritildi. 1 soatga bloklandingiz.' }, 429);
      }
      await c.env.DB.prepare('UPDATE reg_sessions SET attempts = ? WHERE telegram_id = ?').bind(newAttempts, tid).run();
      return c.json({ error: `Kod xato. Qolgan urinishlar: ${MAX_ATTEMPTS - newAttempts}` }, 400);
    }

    // Kod to'g'ri
    return c.json({ ok: true, verified: true });
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

// 3) Yakunlash — username, email, parol
app.post('/auth/register/complete', async (c) => {
  try {
    const { telegramId, username, email, password } = await c.req.json();
    const tid = String(telegramId || '').trim();

    if (!/^\d{6,15}$/.test(tid)) return c.json({ error: 'Noto\'g\'ri Telegram ID' }, 400);
    if (!username || !email || !password) return c.json({ error: 'Barcha maydonlar kerak' }, 400);
    if (password.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi` }, 400);

    const now = Date.now();
    const row = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE telegram_id = ?').bind(tid).first();
    if (!row) return c.json({ error: 'Sessiya topilmadi. Qaytadan boshlang.' }, 400);
    if (row.blocked_until > now) return c.json({ error: 'Bloklangan. Keyinroq urinib ko\'ring.' }, 429);

    const exists = await c.env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ? OR telegram_id = ?')
      .bind(username, email, tid).first();
    if (exists) return c.json({ error: 'Username, email yoki Telegram ID band' }, 409);

    const id = crypto.randomUUID();
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, username, email, await hashPassword(password), 'user', tid),
      c.env.DB.prepare('DELETE FROM reg_sessions WHERE telegram_id = ?').bind(tid),
    ]);

    const jwt = await createToken({ sub: id }, c.env);
    return c.json({ ok: true, token: jwt, user: { id, username, role: 'user', balance: 0 } }, 201);
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

export default app;