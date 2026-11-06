import { Hono } from 'hono';
import { cors } from 'hono/cors';
import userApp from './userIndex.js';
import adminApp from './adminIndex.js';
import qrApp, { ensureQrTable } from './qrAuth.js';
import { createToken } from './utils/jwt.js';
import { hashPassword, verifyPassword, randomPasswordHash } from './utils/password.js';
import { getAuthUser, requireAuth, requireAdmin } from './middleware/auth.js';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ==========================================
// RUXSATLAR (barcha admin va xizmat endpointlari)
// ==========================================
app.use('/fuzz/api/admin/*', requireAdmin);
app.use('/fuzz/api/telegram/*', requireAdmin);
app.use('/fuzz/api/upload', requireAuth);

// init-db: admin bo'lmagan yangi bazada birinchi marta ochiq, keyin faqat admin
app.use('/fuzz/api/init-db', async (c, next) => {
  let hasAdmin = false;
  try {
    hasAdmin = !!(await c.env.DB.prepare("SELECT id FROM users WHERE role IN ('admin','super_admin') LIMIT 1").first());
  } catch { /* users jadvali hali yo'q */ }
  if (hasAdmin) return requireAdmin(c, next);
  await next();
});

const MIN_PASSWORD = 6;
const publicUser = (u) => ({ id: u.id, username: u.username, role: u.role, balance: round2(u.balance || 0) });

const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  return !BANNED_WORDS.some(word => name.toLowerCase().includes(word));
};

// Float xatolarini oldini olish uchun yaxlitlash
const round2 = (num) => Math.round(Number(num) * 100) / 100;

// ==========================================
// TELEGRAM HELPER FUNKSIYALARI
// ==========================================
async function sendTelegramMessage(botToken, chatId, text, replyMarkup = null) {
  const body = { chat_id: chatId, text };
  if (replyMarkup) body.reply_markup = replyMarkup;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    console.error("sendTelegramMessage xatosi:", e);
    return { ok: false, error: e.message };
  }
}

async function answerCallbackQuery(botToken, callbackQueryId, text = null) {
  try {
    const body = { callback_query_id: callbackQueryId };
    if (text) body.text = text;
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("answerCallbackQuery xatosi:", e);
  }
}

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// Telegram webhook holatini tekshirish (debug uchun)
app.get('/fuzz/api/telegram/status', async (c) => {
  try {
    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) return c.json({ error: 'BOT_TOKEN yo\'q' });
    
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message });
  }
});

// ==========================================
// DB INIT (Barcha jadvallar)
// ==========================================
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0,
        telegram_id TEXT, language TEXT DEFAULT 'uz', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, 
        website TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT,
        image TEXT, game_url TEXT, company_id TEXT, available INTEGER DEFAULT 1, 
        discount INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, 
        start_date DATETIME, end_date DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_library (
        id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY, base64_data TEXT NOT NULL, mime_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, total_seconds INTEGER DEFAULT 0, 
        last_played DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS reset_codes (
        id TEXT PRIMARY KEY, username TEXT, code TEXT, expires_at DATETIME
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS bundles (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, image TEXT,
        price REAL DEFAULT 0, discount INTEGER DEFAULT 0, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS bundle_games (
        id TEXT PRIMARY KEY, bundle_id TEXT, game_id TEXT
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY, key_value TEXT NOT NULL, description TEXT,
        permissions TEXT, expires_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY, name TEXT, url TEXT NOT NULL, event_type TEXT,
        secret TEXT, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, 
        permissions TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS rates (
        id TEXT PRIMARY KEY, currency TEXT, rate REAL, source TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS stars_rates (
        id TEXT PRIMARY KEY, amount_usd REAL, stars_amount INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    const existingStarRate = await c.env.DB.prepare('SELECT * FROM stars_rates LIMIT 1').first();
    if (!existingStarRate) {
      await c.env.DB.prepare('INSERT INTO stars_rates (id, amount_usd, stars_amount) VALUES (?, ?, ?)').bind(crypto.randomUUID(), 1, 10).run();
    }

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY, user_id TEXT, amount_usd REAL, stars_paid INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id TEXT PRIMARY KEY, chat_id TEXT, username TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT,
        api_url TEXT,
        enabled INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    const existingMethods = await c.env.DB.prepare('SELECT * FROM payment_methods LIMIT 1').first();
    if (!existingMethods) {
      const defaults = [
        { id: 'stars', name: 'Telegram Stars', logo: '/image/paymentsLogo/telegramStars.png', api: '', enabled: 1, discount: 0 },
        { id: 'card', name: 'Karta', logo: '/image/paymentsLogo/humoUzcard.png', api: '', enabled: 1, discount: 0 },
      ];
      for (const m of defaults) {
        await c.env.DB.prepare('INSERT INTO payment_methods (id, name, logo_url, api_url, enabled, discount) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(m.id, m.name, m.logo, m.api, m.enabled, m.discount).run();
      }
    }

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount_uzs REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME
      );
    `).run();

    await ensureQrTable(c.env.DB);

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Xato: " + err.message }, 500);
  }
});

// ==========================================
// RASM YUKLASH VA KO'RSATISH
// ==========================================
app.post('/fuzz/api/upload', async (c) => {
  try {
    const { base64, mimeType } = await c.req.json();
    if (!base64) return c.json({ error: 'Rasm ma\'lumotlari topilmadi' }, 400);
    if (base64.length > 1500000) return c.json({ error: 'Rasm hajmi juda katta! (Max 1MB)' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO images (id, base64_data, mime_type) VALUES (?, ?, ?)')
      .bind(id, base64, mimeType || 'image/jpeg').run();

    return c.json({ message: 'Rasm yuklandi!', url: `/api/images/${id}` }, 201);
  } catch (err) { return c.json({ error: 'Rasm yuklashda xato' }, 500); }
});

app.get('/fuzz/api/images/:id', async (c) => {
  try {
    const image = await c.env.DB.prepare('SELECT base64_data, mime_type FROM images WHERE id = ?').bind(c.req.param('id')).first();
    if (!image) return c.json({ error: 'Rasm topilmadi' }, 404);

    const binaryStr = atob(image.base64_data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    return c.body(bytes, 200, {
      'Content-Type': image.mime_type || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000'
    });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Parol yoki username xato!' }, 401);
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

    const { ok, needsRehash } = user ? await verifyPassword(password, user.password) : { ok: false };
    if (!user || !ok) return c.json({ error: 'Parol yoki username xato!' }, 401);
    if (user.role === 'banned') return c.json({ error: 'Akkaunt bloklangan' }, 403);

    // Eski ochiq parolni hash'ga o'tkazish
    if (needsRehash) {
      await c.env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(await hashPassword(password), user.id).run();
    }

    const token = await createToken({ sub: user.id }, c.env);
    return c.json({ token, user: publicUser(user) });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.get('/fuzz/api/auth/me', requireAuth, async (c) => {
  const user = await getAuthUser(c);
  return c.json({ user: publicUser(user) });
});

app.post('/fuzz/api/auth/logout', (c) => c.json({ ok: true }));

app.post('/fuzz/api/auth/change-password', requireAuth, async (c) => {
  try {
    const me = await getAuthUser(c);
    const { oldPassword, newPassword } = await c.req.json();
    if (!newPassword || newPassword.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi bo'lishi kerak` }, 400);
    const row = await c.env.DB.prepare('SELECT password FROM users WHERE id = ?').bind(me.id).first();
    const { ok } = await verifyPassword(oldPassword || '', row?.password);
    if (!ok) return c.json({ error: 'Eski parol xato' }, 400);
    await c.env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(await hashPassword(newPassword), me.id).run();
    return c.json({ message: 'Parol yangilandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/register', async (c) => {
  try {
    const { username, email, password, telegramId } = await c.req.json();
    if (!username || !password || !email) return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);
    if (password.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi bo'lishi kerak` }, 400);

    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? OR email = ?').bind(username, email).first();
    if (existing) return c.json({ error: 'Bu username yoki email band!' }, 409);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, username, email, await hashPassword(password), 'user', telegramId || null).run();

    const token = await createToken({ sub: id }, c.env);
    return c.json({ token, user: { id, username, role: 'user', balance: 0 } }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/check-telegram', async (c) => {
  try {
    const { telegramId } = await c.req.json();
    if (!telegramId) return c.json({ error: 'Telegram ID kiritilmadi' }, 400);
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(telegramId).first();
    if (!user) return c.json({ error: 'Bu Telegram ID bilan ro\'yxatdan o\'tilmagan. Iltimos, avval botga /start bosing.' }, 404);
    return c.json({ message: 'Telegram ID tasdiqlandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Reset Password
const RESET_TTL_MS = 10 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

async function ensureResetAttempts(db) {
  try { await db.prepare('ALTER TABLE reset_codes ADD COLUMN attempts INTEGER DEFAULT 0').run(); } catch { /* ustun allaqachon bor */ }
}

function randomCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, '0');
}

// Kodni tekshiradi: noto'g'ri urinishlar soni cheklangan, muddati o'tgan kod qabul qilinmaydi
async function checkResetCode(db, username, code) {
  await ensureResetAttempts(db);
  const record = await db.prepare('SELECT * FROM reset_codes WHERE username = ? ORDER BY expires_at DESC LIMIT 1').bind(username || '').first();
  if (!record || new Date(record.expires_at) < new Date()) return { ok: false, error: 'Kod muddati o\'tgan. Yangi kod so\'rang.' };
  if ((record.attempts || 0) >= RESET_MAX_ATTEMPTS) return { ok: false, error: 'Urinishlar soni tugadi. Yangi kod so\'rang.' };
  if (String(code || '') !== record.code) {
    await db.prepare('UPDATE reset_codes SET attempts = COALESCE(attempts, 0) + 1 WHERE id = ?').bind(record.id).run();
    return { ok: false, error: 'Kod xato!' };
  }
  return { ok: true, record };
}

app.post('/fuzz/api/auth/reset-request', async (c) => {
  try {
    const { username, email } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? AND email = ?').bind(username || '', email || '').first();
    if (!user) return c.json({ error: 'Bunday foydalanuvchi topilmadi!' }, 404);
    if (!user.telegram_id) return c.json({ error: 'Bu akkauntga Telegram ulanmagan — kodni yuborib bo\'lmaydi.' }, 400);

    await ensureResetAttempts(c.env.DB);
    // Spamdan himoya: 60 soniyada bir martadan ko'p emas
    const last = await c.env.DB.prepare('SELECT expires_at FROM reset_codes WHERE username = ? ORDER BY expires_at DESC LIMIT 1').bind(username).first();
    if (last && new Date(last.expires_at).getTime() - RESET_TTL_MS > Date.now() - 60 * 1000) {
      return c.json({ error: 'Kod yaqinda yuborildi. 1 daqiqadan keyin qayta urinib ko\'ring.' }, 429);
    }

    const code = randomCode();
    const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
    await c.env.DB.prepare('DELETE FROM reset_codes WHERE username = ?').bind(username).run();
    await c.env.DB.prepare('INSERT INTO reset_codes (id, username, code, expires_at, attempts) VALUES (?, ?, ?, ?, 0)').bind(crypto.randomUUID(), username, code, expiresAt).run();

    if (c.env.BOT_TOKEN) {
      await sendTelegramMessage(c.env.BOT_TOKEN, user.telegram_id, `Fuzz parolni tiklash kodi: ${code}\n\nKod 10 daqiqa amal qiladi.`);
    }
    return c.json({ message: 'Kod yuborildi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-verify', async (c) => {
  try {
    const { username, code } = await c.req.json();
    const res = await checkResetCode(c.env.DB, username, code);
    if (!res.ok) return c.json({ error: res.error }, 400);
    return c.json({ message: 'Kod tasdiqlandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-password', async (c) => {
  try {
    const { username, code, newPassword } = await c.req.json();
    if (!newPassword || newPassword.length < MIN_PASSWORD) return c.json({ error: `Parol kamida ${MIN_PASSWORD} belgi bo'lishi kerak` }, 400);
    const res = await checkResetCode(c.env.DB, username, code);
    if (!res.ok) return c.json({ error: res.error }, 403);
    await c.env.DB.prepare('UPDATE users SET password = ? WHERE username = ?').bind(await hashPassword(newPassword), username).run();
    await c.env.DB.prepare('DELETE FROM reset_codes WHERE username = ?').bind(username).run();
    return c.json({ message: 'Parol yangilandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// ==========================================
// CONSOLE COMMANDS
// ==========================================
app.post('/fuzz/api/admin/console', async (c) => {
  try {
    const { command } = await c.req.json();
    if (!command) return c.json({ error: 'Buyruq kiritilmadi' }, 400);

    const parts = command.trim().split(/\s+/);
    const action = parts[0].toLowerCase();
    let response = '';

    if (action === 'kill') {
      const target = parts[1];
      if (target === 'all') {
        await c.env.DB.prepare('DELETE FROM users WHERE role != "admin"').run();
        response = "Barcha oddiy foydalanuvchilar o'chirildi.";
      } else {
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(target).first();
        if (user) {
          await c.env.DB.prepare('DELETE FROM users WHERE username = ?').bind(target).run();
          response = `Foydalanuvchi ${target} o'chirildi.`;
        } else {
          await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(target).run();
          response = `O'yin ${target} o'chirildi.`;
        }
      }
    } else if (action === 'give') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];
      if (amount && !isNaN(amount)) {
        await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} ga $${amount} qo'shildi.`;
      } else {
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(targetUser).first();
        if (!user) return c.json({ error: 'Foydalanuvchi topilmadi' }, 404);
        await c.env.DB.prepare('INSERT INTO user_library (id, user_id, game_id) VALUES (?, ?, ?)').bind(crypto.randomUUID(), user.id, typeOrId).run();
        response = `${targetUser} ga o'yin qo'shildi.`;
      }
    } else if (action === 'take') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];
      if (amount && !isNaN(amount)) {
        await c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} dan $${amount} ayirildi.`;
      } else {
        response = `${targetUser} dan o'yin olib tashlandi.`;
      }
    } else if (action === 'discount') {
      const gameId = parts[1];
      const percent = parseInt(parts[2]);
      if (percent < 10 || percent > 95) return c.json({ error: 'Chegirma 10% dan 95% gacha bo\'lishi kerak!' }, 400);
      await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(percent, gameId).run();
      response = `Chegirma qo'llanildi.`;
    } else if (action === 'newname' || action === 'newuser') {
      const newName = parts[1];
      const newBalance = parseFloat(parts[2]) || 0;
      if (!newName || !isNameValid(newName)) return c.json({ error: 'Nom noto\'g\'ri!' }, 400);
      const id = crypto.randomUUID();
      await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)').bind(id, newName, `${newName}@temp.com`, await randomPasswordHash(), 'user', newBalance).run();
      response = `${newName} yaratildi.`;
    } else if (action === 'newupd') {
      const username = parts[1];
      const newRole = parts[2];
      await c.env.DB.prepare('UPDATE users SET role = ? WHERE username = ?').bind(newRole, username).run();
      response = `${username} ning roli ${newRole} ga o'zgartirildi.`;
    } else if (action === 'ban') {
      const username = parts[1];
      await c.env.DB.prepare('UPDATE users SET role = "banned" WHERE username = ?').bind(username).run();
      response = `${username} bloklandi.`;
    } else if (action === 'unban') {
      const username = parts[1];
      await c.env.DB.prepare('UPDATE users SET role = "user" WHERE username = ?').bind(username).run();
      response = `${username} blokdan chiqarildi.`;
    } else if (action === 'help') {
      response = 'kill, give, take, discount, newName, newUpd, ban, unBan, open, clear, exit';
    }

    return c.json({ message: response });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

// ==========================================
// PUBLIC PAYMENT METHODS API
// ==========================================
app.get('/fuzz/api/payment-methods', async (c) => {
  try {
    const methods = await c.env.DB.prepare('SELECT * FROM payment_methods WHERE enabled = 1').all();
    return c.json({ methods: methods.results || [] });
  } catch (err) { return c.json({ methods: [] }); }
});

// ==========================================
// PUBLIC BUNDLES API
// ==========================================
app.get('/fuzz/api/bundles/:id', async (c) => {
  try {
    const bundle = await c.env.DB.prepare('SELECT * FROM bundles WHERE id = ?').bind(c.req.param('id')).first();
    if (!bundle) return c.json({ error: 'Bundle topilmadi' }, 404);
    return c.json({ bundle });
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

// /fuzz/api/bundles/:id/games — userIndex.js da (game_url'siz)

// ==========================================
// TELEGRAM WEBHOOK (To'liq qayta yozildi)
// ==========================================
app.post('/fuzz/telegram/webhook', async (c) => {
  try {
    // Faqat Telegram'dan kelgan so'rovlar: setWebhook'da berilgan secret_token tekshiriladi
    const expectedSecret = c.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expectedSecret || c.req.header('X-Telegram-Bot-Api-Secret-Token') !== expectedSecret) {
      return c.json({ ok: false }, 401);
    }

    const update = await c.req.json();

    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error("BOT_TOKEN topilmadi!");
      return c.json({ ok: false, error: 'Bot token yo\'q' }, 500);
    }

    // ==========================================
    // 0. SUCCESSFUL PAYMENT (Stars to'lovi yakunlanganda)
    //    Bu blok "message" blokidan OLDIN turishi shart — aks holda unga hech qachon yetib kelinmaydi.
    // ==========================================
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const parts = String(payment.invoice_payload || '').split('|');

      if (payment.currency === 'XTR' && parts.length === 3 && parts[0] === 'stars_pay') {
        const amountUsd = parseFloat(parts[2]);
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(chatId.toString()).first();
        const chargeId = payment.telegram_payment_charge_id || crypto.randomUUID();

        // Bir to'lovni ikki marta hisoblamaslik (Telegram qayta yuborishi mumkin)
        try { await c.env.DB.prepare('ALTER TABLE payments ADD COLUMN charge_id TEXT').run(); } catch { /* bor */ }
        const dup = await c.env.DB.prepare('SELECT id FROM payments WHERE charge_id = ?').bind(chargeId).first();

        if (user && !dup && amountUsd > 0) {
          await c.env.DB.batch([
            c.env.DB.prepare('UPDATE users SET balance = ROUND(COALESCE(balance, 0) + ?, 2) WHERE id = ?').bind(amountUsd, user.id),
            c.env.DB.prepare('INSERT INTO payments (id, user_id, amount_usd, stars_paid, charge_id) VALUES (?, ?, ?, ?, ?)')
              .bind(crypto.randomUUID(), user.id, amountUsd, payment.total_amount, chargeId),
          ]);
          const fresh = await c.env.DB.prepare('SELECT balance FROM users WHERE id = ?').bind(user.id).first();
          await sendTelegramMessage(
            BOT_TOKEN,
            chatId,
            `✅ To'lov muvaffaqiyatli!\n\nBalansingiz +$${amountUsd} ga to'ldirildi.\nJoriy balans: $${round2(fresh?.balance || 0)}`
          );
        } else if (!user) {
          console.error("Successful payment: foydalanuvchi topilmadi, chatId =", chatId);
        }
      }
      return c.json({ ok: true });
    }

    // ==========================================
    // 1. XABARLAR (message)
    // ==========================================
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const from = update.message.from;
      const firstName = from.first_name || 'User';
      const lastName = from.last_name || '';
      const tgUsername = from.username || '';

      // --- /start buyrug'i ---
      if (text.startsWith('/start')) {
        const textParts = text.split(' ');
        const startParam = textParts.length > 1 ? textParts[1] : null;

        // Agar pay_ bilan boshlansa -> Stars invoice
        if (startParam && startParam.startsWith('pay_')) {
          // Narxni foydalanuvchi emas, admin belgilagan stars_rates jadvali belgilaydi
          const amountUsd = parseFloat(startParam.split('_')[1]);
          const rate = isNaN(amountUsd) ? null : await c.env.DB.prepare(
            'SELECT stars_amount FROM stars_rates WHERE amount_usd = ? ORDER BY created_at DESC LIMIT 1'
          ).bind(amountUsd).first();
          const starsAmount = rate ? parseInt(rate.stars_amount, 10) : NaN;

          if (isNaN(amountUsd) || isNaN(starsAmount) || starsAmount <= 0) {
            await sendTelegramMessage(BOT_TOKEN, chatId, "❌ Noto'g'ri to'lov parametri.");
            return c.json({ ok: true });
          }

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendInvoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              title: `Fuzz Balans +$${amountUsd}`,
              description: `Balansingizni $${amountUsd} ga to'ldirish`,
              payload: `stars_pay|${chatId}|${amountUsd}`,
              provider_token: "",
              currency: "XTR",
              prices: [{ label: `${amountUsd} USD`, amount: starsAmount }],
            }),
          });
          return c.json({ ok: true });
        }

        // Oddiy /start - foydalanuvchini bazaga qo'shish (agar yo'q bo'lsa)
        const existing = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(chatId.toString()).first();
        if (!existing) {
          const id = crypto.randomUUID();
          await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(id, tgUsername || firstName, `${chatId}@tg.temp`, await randomPasswordHash(), 'user', chatId.toString()).run();
        }

        // Til tanlash tugmalarini yuborish
        await sendTelegramMessage(
          BOT_TOKEN,
          chatId,
          "Iltimos, tilingizni tanlang:\nPlease choose your language:\nПожалуйста, выберите ваш язык:",
          {
            inline_keyboard: [
              [
                { text: "🇺🇿 Uzb", callback_data: "lang_uz" },
                { text: "🇬🇧 Eng", callback_data: "lang_en" },
                { text: "🇷🇺 Rus", callback_data: "lang_ru" }
              ]
            ]
          }
        );
        return c.json({ ok: true });
      }

      // --- Boshqa matnli xabarlar (support) ---
      if (text && !text.startsWith('/')) {
        try {
          await c.env.DB.prepare('INSERT INTO support_messages (id, chat_id, username, message) VALUES (?, ?, ?, ?)')
            .bind(crypto.randomUUID(), chatId.toString(), tgUsername || firstName, text).run();
        } catch (e) {
          console.error("Support message saqlashda xato:", e);
        }

        // Adminlarga bildirishnoma yuborish
        try {
          const ADMIN_IDS = c.env.ADMIN_IDS ? c.env.ADMIN_IDS.split(',').map(s => s.trim()) : [];
          for (const adminId of ADMIN_IDS) {
            await sendTelegramMessage(
              BOT_TOKEN,
              adminId,
              `📩 Yangi xabar:\n\nKimdan: ${firstName} ${lastName} (@${tgUsername || 'yo\'q'})\nChat ID: ${chatId}\n\nXabar: ${text}`
            );
          }
        } catch (e) {
          console.error("Adminga bildirishnoma yuborishda xato:", e);
        }

        // Foydalanuvchiga tasdiq
        await sendTelegramMessage(
          BOT_TOKEN,
          chatId,
          "✅ Xabaringiz qabul qilindi. Admin tez orada javob beradi."
        );
        return c.json({ ok: true });
      }

      return c.json({ ok: true });
    }

    // ==========================================
    // 2. CALLBACK QUERY (tugma bosilganda)
    // ==========================================
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      // Til tanlash
      if (data.startsWith('lang_')) {
        const lang = data.split('_')[1];
        const firstName = callbackQuery.from.first_name || 'User';
        const lastName = callbackQuery.from.last_name || '';

        await c.env.DB.prepare('UPDATE users SET language = ? WHERE telegram_id = ?')
          .bind(lang, chatId.toString()).run();

        // Callback'ni tasdiqlash
        await answerCallbackQuery(BOT_TOKEN, callbackQuery.id);

        let welcomeMessage = '';
        if (lang === 'uz') {
          welcomeMessage = `Salom, ${firstName} ${lastName}!\n\nFuzz App botiga xush kelibsiz.\nSizning ID: ${chatId}\n\nBizni tanlaganingiz uchun rahmat.`;
        } else if (lang === 'en') {
          welcomeMessage = `Hi ${firstName} ${lastName}!\n\nWelcome to Fuzz App bot.\nYour ID: ${chatId}\n\nThank you for choosing us.`;
        } else if (lang === 'ru') {
          welcomeMessage = `Привет, ${firstName} ${lastName}!\n\nДобро пожаловать в бот Fuzz App.\nВаш ID: ${chatId}\n\nСпасибо, что выбрали нас.`;
        }

        await sendTelegramMessage(
          BOT_TOKEN,
          chatId,
          welcomeMessage,
          {
            inline_keyboard: [
              [
                {
                  text: "🚀 Fuzz App'ni ochish",
                  web_app: { url: `https://fuzz-tau.vercel.app/register/form?tgId=${chatId}` }
                }
              ]
            ]
          }
        );
        return c.json({ ok: true });
      }

      // Boshqa callback'lar uchun
      await answerCallbackQuery(BOT_TOKEN, callbackQuery.id);
      return c.json({ ok: true });
    }

    // ==========================================
    // 3. PRE-CHECKOUT QUERY (Stars to'lovdan oldin)
    // ==========================================
    if (update.pre_checkout_query) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: update.pre_checkout_query.id,
            ok: true,
          }),
        });
      } catch (e) {
        console.error("Pre-checkout xatosi:", e);
      }
      return c.json({ ok: true });
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error("Webhook xatosi:", err);
    // Telegram qayta yubormasligi uchun har doim 200 qaytaramiz
    return c.json({ ok: true });
  }
});

// ==========================================
// TELEGRAM WEBHOOK'NI SOZLASH (Admin uchun)
// ==========================================
app.post('/fuzz/api/telegram/set-webhook', async (c) => {
  try {
    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) return c.json({ error: 'BOT_TOKEN yo\'q' }, 500);

    const webhookUrl = 'https://my-backend.updbackend.workers.dev/fuzz/telegram/webhook';
    const secret = c.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) return c.json({ error: "TELEGRAM_WEBHOOK_SECRET yo'q: npx wrangler secret put TELEGRAM_WEBHOOK_SECRET" }, 500);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, secret_token: secret }),
    });
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/fuzz/api/telegram/delete-webhook', async (c) => {
  try {
    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) return c.json({ error: 'BOT_TOKEN yo\'q' }, 500);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const data = await res.json();
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Barcha user va admin API'larni ulash
app.route('/fuzz/api', qrApp);
app.route('/fuzz/api', userApp);
app.route('/fuzz/api', adminApp);

export default app;