import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 1. CORS Sozlamalari (Barcha domenlarga ruxsat - test uchun)
// Agar xavfsizlikni kuchaytirmoqchi bo'lsangiz, '*' o'rniga aniq domenlarni yozing.
app.use('*', cors({
  origin: '*', 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // '*' bilan credentials true ishlamaydi
}));

// 2. Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 3. DB Init (Jadvallarni yaratish)
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
    
    return c.json({ message: "Ma'lumotlar bazasi jadvallari yaratildi!" });
  } catch (err) {
    return c.json({ error: "Jadval yaratishda xato: " + err.message }, 500);
  }
});

// 4. Admin Stats
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    return c.json({ users: usersCount.c || 0, games: gamesCount.c || 0, revenue: 0 });
  } catch (err) {
    return c.json({ error: 'Statistika olishda xato' }, 500);
  }
});

// 5. Admin Users List
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) {
    return c.json({ error: 'Foydalanuvchilarni olishda xato' }, 500);
  }
});

// 6. Admin All Games
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) {
    return c.json({ error: 'O\'yinlarni olishda xato' }, 500);
  }
});

// 7. Admin Game Create
app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url } = await c.req.json();
    if (!title || !price || !game_url) return c.json({ error: 'Majburiy maydonlarni to\'ldiring!' }, 400);
    
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, available) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre, image, game_url, 1).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) {
    return c.json({ error: 'Server xatosi' }, 500);
  }
});

// 8. Auth Login
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
          .bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }
    
    if (!user || user.password !== password) return c.json({ error: 'Parol xato!' }, 401);
    
    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) {
    return c.json({ error: 'Serverda xatolik' }, 500);
  }
});

export default app;