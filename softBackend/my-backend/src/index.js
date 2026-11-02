import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Taqiqlangan so'zlar
const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return !BANNED_WORDS.some(word => lowerName.includes(word));
};

// 1. Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 2. Init DB
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
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, 
        website TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT,
        image TEXT, game_url TEXT, company_id TEXT, available INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, 
        start_date DATETIME, end_date DATETIME
      );
    `).run();

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Jadval yaratishda xato: " + err.message }, 500);
  }
});

// 3. Auth Login
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
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// 4. Admin Stats
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    return c.json({ users: usersCount.c || 0, games: gamesCount.c || 0, revenue: 0 });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// 5. Admin Users
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// 6. Admin Games
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url, company_id } = await c.req.json();
    if (!isNameValid(title)) return c.json({ error: 'Taqiqlangan so\'zlar bor!' }, 400);
    if (!company_id) return c.json({ error: 'Kompaniyani tanlang!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, company_id, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre, image, game_url, company_id, 1).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// 7. Admin Companies
app.get('/fuzz/api/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

app.post('/fuzz/api/admin/companies', async (c) => {
  try {
    const { name, logo, website, description } = await c.req.json();
    if (!isNameValid(name)) return c.json({ error: 'Kompaniya nomida taqiqlangan so\'zlar bor!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO companies (id, name, logo, website, description) VALUES (?, ?, ?, ?, ?)')
      .bind(id, name, logo, website, description).run();
      
    return c.json({ message: "Kompaniya qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// 8. Public Games
app.get('/fuzz/api/games', async (c) => {
  try {
    const companyId = c.req.query('companyId');
    let query = 'SELECT * FROM games WHERE available = 1';
    let params = [];
    if (companyId) {
      query += ' AND company_id = ?';
      params.push(companyId);
    }
    const games = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

// 9. Admin Events
app.get('/fuzz/api/admin/events', async (c) => {
  try {
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

app.post('/fuzz/api/admin/events', async (c) => {
  try {
    const { title, image, link_url, start_date, end_date } = await c.req.json();
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO events (id, title, image, link_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, title, image, link_url, start_date, end_date).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

export default app;