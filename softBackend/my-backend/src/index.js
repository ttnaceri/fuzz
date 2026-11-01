import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 1. Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 2. Init Database
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

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL DEFAULT 0,
        genre TEXT,
        image TEXT,
        available INTEGER DEFAULT 0
      );
    `).run();

    return c.json({ message: "Ma'lumotlar bazasi jadvallari yaratildi!" });
  } catch (err) {
    return c.json({ error: "Jadval yaratishda xato: " + err.message }, 500);
  }
});

// 3. Authentication: Register
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

// 4. Authentication: Login
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Foydalanuvchi nomi va parolni kiriting!' }, 400);

    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

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

// ==========================================
// 5. ADMIN API ROUTES (YANGI)
// ==========================================

// 5.1 Admin Dashboard Stats
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM games').first();
    const totalBalance = await c.env.DB.prepare('SELECT SUM(balance) as sum FROM users').first();

    return c.json({
      users: usersCount?.count || 0,
      games: gamesCount?.count || 3,
      revenue: totalBalance?.sum || 0,
    });
  } catch (err) {
    return c.json({ error: 'Statistika olishda xato' }, 500);
  }
});

// 5.2 Admin Users List
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance, created_at FROM users').all();
    return c.json({ users: users.results });
  } catch (err) {
    return c.json({ error: 'Foydalanuvchilarni olishda xato' }, 500);
  }
});

// 5.3 Admin Games List
app.get('/fuzz/api/admin/games', async (c) => {
  try {
    // Hozircha o'yinlar bazada bo'sh bo'lsa ham, frontendda ko'rsatish uchun static ma'lumot
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) {
    return c.json({ error: 'O\'yinlarni olishda xato' }, 500);
  }
});

// 6. Telegram Webhook
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