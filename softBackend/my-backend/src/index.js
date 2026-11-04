import { Hono } from 'hono';
import { cors } from 'hono/cors';
import userApp from './userIndex.js';
import adminApp from './adminIndex.js';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  return !BANNED_WORDS.some(word => name.toLowerCase().includes(word));
};

// Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// DB Init
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

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Xato: " + err.message }, 500);
  }
});

// Rasm yuklash
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

// Auth
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }

    if (!user || user.password !== password) return c.json({ error: 'Parol yoki username xato!' }, 401);
    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/register', async (c) => {
  try {
    const { username, email, password, telegramId } = await c.req.json();
    if (!username || !password || !email) return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);

    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? OR email = ?').bind(username, email).first();
    if (existing) return c.json({ error: 'Bu username yoki email band!' }, 409);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, username, email, password, 'user', telegramId || null).run();

    return c.json({ user: { id, username, role: 'user', balance: 0 } }, 201);
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
app.post('/fuzz/api/auth/reset-request', async (c) => {
  try {
    const { username, email, passwordEnd } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? AND email = ?').bind(username, email).first();
    if (!user) return c.json({ error: 'Bunday foydalanuvchi topilmadi!' }, 404);
    if (passwordEnd && user.password.slice(-2) !== passwordEnd) return c.json({ error: 'Parolning oxirgi 2 belgisi xato!' }, 400);

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await c.env.DB.prepare('INSERT INTO reset_codes (id, username, code, expires_at) VALUES (?, ?, ?, ?)').bind(id, username, code, expiresAt).run();

    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (BOT_TOKEN && user.telegram_id) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: user.telegram_id, text: `Fuzz parolni tiklash kodi: ${code}\n\nKod 10 daqiqa amal qiladi.` })
      });
    }
    return c.json({ message: 'Kod yuborildi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-verify', async (c) => {
  try {
    const { username, code } = await c.req.json();
    const record = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE username = ? AND code = ? ORDER BY expires_at DESC LIMIT 1').bind(username, code).first();
    if (!record) return c.json({ error: 'Kod xato!' }, 400);
    if (new Date(record.expires_at) < new Date()) return c.json({ error: 'Kod muddati o\'tgan!' }, 400);
    return c.json({ message: 'Kod tasdiqlandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-password', async (c) => {
  try {
    const { username, code, newPassword } = await c.req.json();
    const record = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE username = ? AND code = ?').bind(username, code).first();
    if (!record) return c.json({ error: 'Ruxsatsiz so\'rov!' }, 403);
    await c.env.DB.prepare('UPDATE users SET password = ? WHERE username = ?').bind(newPassword, username).run();
    await c.env.DB.prepare('DELETE FROM reset_codes WHERE username = ?').bind(username).run();
    return c.json({ message: 'Parol yangilandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Console Commands
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
      await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)').bind(id, newName, `${newName}@temp.com`, '123456', 'user', newBalance).run();
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

// Telegram Webhook
app.post('/fuzz/telegram/webhook', async (c) => {
  try {
    const update = await c.req.json();
    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) return c.json({ error: 'Bot token yo\'q' }, 500);
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // 1. /start bosilganda
    if (update.message && update.message.text && update.message.text.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name || 'User';
      const lastName = update.message.from.last_name || '';
      const startParam = update.message.text.split(' ')[1];

      // Agar /start pay_... bo'lsa, Stars to'lovini yuborish
      if (startParam && startParam.startsWith('pay_')) {
        const [_, amountStr, starsStr] = startParam.split('_');
        const amountUsd = parseFloat(amountStr);
        const starsAmount = parseInt(starsStr);

        // Telegram Stars Invoice yuborish
        await fetch(`${TELEGRAM_API}/sendInvoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            title: `Fuzz Balans +$${amountUsd}`,
            description: `Balansingizni $${amountUsd} ga to'ldirish`,
            payload: `stars_pay:${chatId}:${amountUsd}`,
            provider_token: "",
            currency: "XTR",
            prices: [{ label: `${amountUsd} USD`, amount: starsAmount }],
          }),
        });
      } else {
        // Oddiy /start (til tanlash)
        const existing = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(chatId).first();
        if (!existing) {
          const id = crypto.randomUUID();
          await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)').bind(id, firstName + lastName, `${firstName}@temp.com`, '123456', 'user', chatId).run();
        }

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Iltimos, tilingizni tanlang:\nPlease choose your language:\nПожалуйста, выберите ваш язык:",
            reply_markup: {
              inline_keyboard: [
                [ { text: "🇺🇿 Uzb", callback_data: "lang_uz" }, { text: "🇬🇧 Eng", callback_data: "lang_en" }, { text: "🇷🇺 Rus", callback_data: "lang_ru" } ]
              ]
            }
          }),
        });
      }
    }

    // 2. Callback (til tanlash yoki Stars to'lov tugmasi)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      if (data.startsWith('lang_')) {
        const lang = data.split('_')[1];
        const firstName = update.callback_query.from.first_name || 'User';
        const lastName = update.callback_query.from.last_name || '';

        await c.env.DB.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').bind(lang, chatId).run();

        let welcomeMessage = '';
        if (lang === 'uz') welcomeMessage = `Salom, ${firstName} ${lastName}!\nFuzz App botiga xush kelibsiz.\nID: ${chatId}\nBizni tanlaganingiz uchun rahmat.`;
        else if (lang === 'en') welcomeMessage = `Hi ${firstName} ${lastName}!\nWelcome to Fuzz App bot.\nID: ${chatId}\nThank you for choosing us.`;
        else if (lang === 'ru') welcomeMessage = `Привет, ${firstName} ${lastName}!\nДобро пожаловать в бот Fuzz App.\nID: ${chatId}\nСпасибо, что выбрали нас.`;

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            reply_markup: {
              inline_keyboard: [
                [ { text: "🚀 Fuzz App'ni ochish", web_app: { url: `https://fuzz-tau.vercel.app/register/form?tgId=${chatId}` } } ]
              ]
            }
          }),
        });
      }
    }

    // 3. Pre-checkout (Telegram to'lovni tasdiqlashdan oldin so'raydi)
    if (update.pre_checkout_query) {
      await fetch(`${TELEGRAM_API}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true,
        }),
      });
    }

    // 4. Muvaffaqiyatli to'lov (Stars yechildi)
    if (update.message && update.message.successful_payment) {
      const payment = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const payload = payment.invoice_payload;

      const parts = payload.split(':');
      const userId = parts[1];
      const amountUsd = parseFloat(parts[2]);

      const user = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(chatId.toString()).first();
      if (user) {
        await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE telegram_id = ?')
          .bind(amountUsd, chatId.toString()).run();
        
        await c.env.DB.prepare('INSERT INTO payments (id, user_id, amount_usd, stars_paid) VALUES (?, ?, ?, ?)')
          .bind(crypto.randomUUID(), user.id, amountUsd, payment.total_amount).run();

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ To'lov muvaffaqiyatli!\n\nBalansingiz +$${amountUsd} ga to'ldirildi.`,
          }),
        });
      }
    }

    return c.json({ ok: true });
  } catch (err) { return c.json({ error: 'Webhook xatosi' }, 500); }
});

// Barcha user va admin API'larni ulash
app.route('/fuzz/api', userApp);
app.route('/fuzz/api', adminApp);

export default app;