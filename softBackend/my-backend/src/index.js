import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 1. Health Check (Ishlayapti)
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 2. Init DB (Jadval yaratish - qaytarildi)
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        balance REAL DEFAULT 0,
        telegram_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    return c.json({ message: "Ma'lumotlar bazasi jadvali yaratildi!" });
  } catch (err) {
    return c.json({ error: "Jadval yaratishda xato: " + err.message }, 500);
  }
});

// 3. Register API
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
  } catch (err) {
    return c.json({ error: 'Serverda xatolik' }, 500);
  }
});

// 4. Login API
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Foydalanuvchi nomi va parolni kiriting!' }, 400);

    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

    // Test akkauntlar (agar bazada bo'lmasa)
    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
          .bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }

    if (!user || user.password !== password) return c.json({ error: 'Foydalanuvchi nomi yoki parol xato!' }, 401);

    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) {
    return c.json({ error: 'Serverda xatolik' }, 500);
  }
});

// 5. Telegram Webhook
app.post('/fuzz/telegram/webhook', async (c) => {
  try {
    const update = await c.req.json();
    const BOT_TOKEN = c.env.BOT_TOKEN; 
    if (!BOT_TOKEN) return c.json({ error: 'Bot token sozlanmagan' }, 500);

    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name || 'User';

      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👋 Salom, ${firstName}!\n\nSaytda ro'yxatdan o'tishni tasdiqlash uchun pastdagi tugmani bosing.`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Tasdiqlash (App)",
                  web_app: { url: `https://fuzz-tau.vercel.app/register/form?tgId=${chatId}` }
                }
              ]
            ]
          }
        }),
      });
    }

    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: 'Webhook xatosi' }, 500);
  }
});

export default app;