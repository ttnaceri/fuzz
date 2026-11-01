import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// DB Init (Barcha jadvallar, jumladan o'yin vaqtini kuzatish uchun)
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0,
        telegram_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT,
        image TEXT, game_url TEXT, available INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // Foydalanuvchining o'yinlarda qancha vaqt o'tkazganini yozib borish jadvali
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, 
        total_seconds INTEGER DEFAULT 0, last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(game_id) REFERENCES games(id)
      );
    `).run();

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Xato: " + err.message }, 500);
  }
});

// Admin: Yangi o'yin qo'shish (Endi game_url bilan)
app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url } = await c.req.json();
    if (!title || !price || !game_url) return c.json({ error: 'Nom, Narx va O\'yin URL manzilini kiriting!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO games (id, title, price, genre, image, game_url, available) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, title, parseFloat(price), genre || 'Web Game', image || '', game_url, 1).run();

    return c.json({ message: "O'yin qo'shildi!", id }, 201);
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

// O'yinni ochish (Faqat sotib olganlar uchun)
app.get('/fuzz/api/games/:id/play', async (c) => {
  const gameId = c.req.param('id');
  const userId = c.req.query('userId'); // Hozircha soddalik uchun query dan olamiz

  try {
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
    if (!game) return c.json({ error: 'O\'yin topilmadi' }, 404);

    // Sotib olinganligini tekshirish (Bu yerda to'liq logika kerak, hozircha mock)
    
    return c.json({ game_url: game.game_url });
  } catch (err) {
    return c.json({ error: 'Xato' }, 500);
  }
});

// O'yin statistikasini saqlash (Vaqt hisoblagichi)
app.post('/fuzz/api/games/track-time', async (c) => {
  try {
    const { userId, gameId, seconds } = await c.req.json();
    if (!userId || !gameId || !seconds) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);

    // Agar bu user bu o'yinni birinchi marta o'ynayotgan bo'lsa
    const existing = await c.env.DB.prepare('SELECT * FROM game_stats WHERE user_id = ? AND game_id = ?').bind(userId, gameId).first();

    if (existing) {
      await c.env.DB.prepare('UPDATE game_stats SET total_seconds = total_seconds + ?, last_played = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(seconds, existing.id).run();
    } else {
      const id = crypto.randomUUID();
      await c.env.DB.prepare('INSERT INTO game_stats (id, user_id, game_id, total_seconds) VALUES (?, ?, ?, ?)')
        .bind(id, userId, gameId, seconds).run();
    }

    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: 'Xato' }, 500);
  }
});

// Auth qismlari (Oldingidek qoladi)
app.post('/fuzz/api/auth/login', async (c) => { /* ... */ });
app.post('/fuzz/api/auth/register', async (c) => { /* ... */ });

export default app;