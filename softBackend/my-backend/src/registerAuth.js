// softBackend/my-backend/src/registerAuth.js
// Telegram WebApp initData orqali egalikni isbotlash.

import { Hono } from 'hono';
import { createToken } from './utils/jwt.js';
import { hashPassword } from './utils/password.js';

const MIN_PASSWORD = 6;
const REG_TTL_MS = 10 * 60 * 1000; // 10 daqiqa

function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

function randomCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, '0');
}

export async function ensureRegisterTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS reg_sessions (
      token TEXT PRIMARY KEY,
      telegram_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      user_agent TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `).run();
}

// Telegram WebApp initData imzosini tekshirish (WebAppData HMAC)
async function verifyTelegramInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    // data-check-string: barcha maydonlar alifbo tartibida, \n bilan
    const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    // secret_key = HMAC_SHA256("WebAppData", bot_token)
    const enc = new TextEncoder();
    const secretKeyRaw = await crypto.subtle.importKey(
      'raw', enc.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const secretKey = await crypto.subtle.sign('HMAC', secretKeyRaw, enc.encode(botToken));

    const dataKey = await crypto.subtle.importKey(
      'raw', new Uint8Array(secretKey),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const expected = await crypto.subtle.sign('HMAC', dataKey, enc.encode(dataCheckString));
    const expectedHex = Array.from(new Uint8Array(expected), (b) => b.toString(16).padStart(2, '0')).join('');

    if (expectedHex !== hash) return null;
    const userJson = params.get('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

async function sendBotMessage(botToken, chatId, text, replyMarkup = null) {
  const body = { chat_id: chatId, text };
  if (replyMarkup) body.reply_markup = replyMarkup;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const app = new Hono();

// 1) Boshlash: Telegram ID ni qabul qilamiz, botga havola yuboramiz
app.post('/auth/register/start', async (c) => {
  try {
    await ensureRegisterTable(c.env.DB);
    const { telegramId } = await c.req.json();
    const tid = String(telegramId || '').trim();
    if (!/^\d{6,15}$/.test(tid)) return c.json({ error: 'Noto\'g\'ri Telegram ID' }, 400);

    // Bu ID band emasligini tekshirish
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE telegram_id = ?').bind(tid).first();
    if (existing) return c.json({ error: 'Bu Telegram ID allaqachon ro\'yxatdan o\'tgan' }, 409);

    const token = randomToken();
    const now = Date.now();
    const expiresAt = now + REG_TTL_MS;
    const ua = (c.req.header('User-Agent') || '').slice(0, 200);
    await c.env.DB.prepare(
      'INSERT INTO reg_sessions (token, telegram_id, status, user_agent, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(token, tid, 'pending', ua, now, expiresAt).run();

    // Botga havola yuboramiz
    const url = `https://t.me/FuzzAppBot?start=reg_${token}`;
    const msg = await sendBotMessage(
      c.env.BOT_TOKEN, tid,
      `Fuzz'da ro'yxatdan o'tish uchun quyidagi tugmani bosing:`,
      { inline_keyboard: [[{ text: "✅ Tasdiqlash", url }]] }
    );
    if (!msg.ok) {
      // Bot xabar yubora olmadi (user botni boshlamagan)
      return c.json({ error: "Botga xabar yuborib bo'lmadi. Avval @FuzzAppBot ga /start bosing va qayta urinib ko'ring." }, 400);
    }

    return c.json({ token, expiresAt, ttlMs: REG_TTL_MS });
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

// 2) Polling: holatni tekshirish
app.get('/auth/register/status', async (c) => {
  try {
    const token = c.req.query('token') || '';
    if (!/^[a-f0-9]{64}$/.test(token)) return c.json({ error: 'Noto\'g\'ri token' }, 400);
    const row = await c.env.DB.prepare('SELECT status, expires_at FROM reg_sessions WHERE token = ?').bind(token).first();
    if (!row || row.expires_at <= Date.now()) return c.json({ status: 'expired' });
    return c.json({ status: row.status });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

// 3) WebApp tasdiqlash: initData orqali egalikni isbotlash
// registerAuth.js — /auth/register/confirm endpoint
app.post('/auth/register/confirm', async (c) => {
  try {
    const { token, initData } = await c.req.json();
    if (!/^[a-f0-9]{64}$/.test(token || '')) return c.json({ error: 'Noto\'g\'ri token' }, 400);

    // initData bo'lsa — Telegram imzosini tekshiramiz
    if (initData) {
      const userData = await verifyTelegramInitData(initData, c.env.BOT_TOKEN);
      if (!userData) return c.json({ error: 'Telegram imzosi xato' }, 403);
      const row = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE token = ?').bind(token).first();
      if (!row || row.status !== 'pending' || row.expires_at <= Date.now()) {
        return c.json({ error: 'Havola eskirgan yoki ishlatilgan' }, 410);
      }
      if (String(userData.id) !== row.telegram_id) {
        return c.json({ error: 'Bu havola boshqa Telegram akkaunt uchun' }, 403);
      }
      await c.env.DB.prepare("UPDATE reg_sessions SET status = 'confirmed' WHERE token = ?").bind(token).run();
      return c.json({ ok: true, telegramId: row.telegram_id, username: userData.username || null });
    }

    // initData bo'lmasa — brauzerda ochilgan (xavfsizlik zaif, lekin ishlaydi)
    const row = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE token = ?').bind(token).first();
    if (!row || row.status !== 'pending' || row.expires_at <= Date.now()) {
      return c.json({ error: 'Havola eskirgan yoki ishlatilgan' }, 410);
    }
    await c.env.DB.prepare("UPDATE reg_sessions SET status = 'confirmed' WHERE token = ?").bind(token).run();
    return c.json({ ok: true, telegramId: row.telegram_id });
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

// 4) Yakunlash: username, email, password
app.post('/auth/register/complete', async (c) => {
  try {
    const { token, username, email, password } = await c.req.json();
    if (!/^[a-f0-9]{64}$/.test(token || '')) return c.json({ error: 'Noto\'g\'ri token' }, 400);
    if (!username || !email || !password) return c.json({ error: 'Barcha maydonlar kerak' }, 400);
    if (password.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi` }, 400);

    const row = await c.env.DB.prepare('SELECT * FROM reg_sessions WHERE token = ?').bind(token).first();
    if (!row || row.status !== 'confirmed' || row.expires_at <= Date.now()) {
      return c.json({ error: 'Tasdiqlash eskirgan. Qaytadan boshlang.' }, 410);
    }

    const exists = await c.env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first();
    if (exists) return c.json({ error: 'Username yoki email band' }, 409);

    const id = crypto.randomUUID();
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, username, email, await hashPassword(password), 'user', row.telegram_id),
      c.env.DB.prepare("UPDATE reg_sessions SET status = 'completed' WHERE token = ?").bind(token),
    ]);

    const jwt = await createToken({ sub: id }, c.env);
    return c.json({ ok: true, token: jwt, user: { id, username, role: 'user', balance: 0 } }, 201);
  } catch (err) {
    return c.json({ error: 'Server xatosi', detail: String(err?.message || err) }, 500);
  }
});

export default app;