import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get('/fuzz/api/health', (c) => c.json({ status: 'ok' }));

// DB Init
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0, telegram_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT, image TEXT, game_url TEXT, available INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, start_date DATETIME, end_date DATETIME);`).run();
    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) { return c.json({ error: err.message }, 500); }
});

// Admin Auth
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    // Default Admin yaratish
    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }
    if (!user || user.password !== password) return c.json({ error: 'Parol xato!' }, 401);
    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

// Stats & Dashboard
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    const gamesData = await c.env.DB.prepare('SELECT SUM(price) as sum FROM games').first();
    return c.json({ users: usersCount.c, games: gamesCount.c, revenue: gamesData.sum || 0 });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// All Games (Barcha o'yinlar ro'yxati)
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Games Create
app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url } = await c.req.json();
    if (!title || !price || !game_url) return c.json({ error: 'Majburiy maydonlarni to\'ldiring!' }, 400);
    
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, available) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre, image, game_url, 1).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Games Delete
app.delete('/fuzz/api/admin/games/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Users List & Delete
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.delete('/fuzz/api/admin/users/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Events
app.get('/fuzz/api/admin/events', async (c) => {
  const events = await c.env.DB.prepare('SELECT * FROM events').all();
  return c.json({ events: events.results });
});

app.post('/fuzz/api/admin/events', async (c) => {
  const { title, image, link_url, start_date, end_date } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare('INSERT INTO events (id, title, image, link_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, title, image, link_url, start_date, end_date).run();
  return c.json({ success: true });
});

export default app;