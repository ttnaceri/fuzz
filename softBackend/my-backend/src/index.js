import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Taqiqlangan so'zlar
const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return !BANNED_WORDS.some(word => lowerName.includes(word));
};

// Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok' }));

// DB Init
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0, telegram_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, website TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    
    // O'yinlar jadvaliga chegirma (discount) ustuni qo'shildi
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT,
        image TEXT, game_url TEXT, company_id TEXT, available INTEGER DEFAULT 1, 
        discount INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, start_date DATETIME, end_date DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    
    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Xato: " + err.message }, 500);
  }
});

// Auth Login
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }
    
    if (!user || user.password !== password) return c.json({ error: 'Parol xato!' }, 401);
    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin Stats
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    return c.json({ users: usersCount.c || 0, games: gamesCount.c || 0, revenue: 0 });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Users
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Games (Barcha o'yinlar va chegirmalar)
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin: O'yin yaratish
app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url, company_id } = await c.req.json();
    if (!isNameValid(title)) return c.json({ error: 'Taqiqlangan so\'zlar bor!' }, 400);
    if (!company_id) return c.json({ error: 'Kompaniyani tanlang!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, company_id, available, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre, image, game_url, company_id, 1, 0).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin: O'yinni o'chirish
app.delete('/fuzz/api/admin/games/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin: O'yinni chegirma qo'shish (10% dan 95% gacha)
app.put('/fuzz/api/admin/games/:id/discount', async (c) => {
  try {
    const { discount } = await c.req.json();
    const gameId = c.req.param('id');
    
    if (discount < 10 || discount > 95) {
      return c.json({ error: 'Chegirma 10% dan 95% gacha bo\'lishi shart!' }, 400);
    }

    await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(discount, gameId).run();
    return c.json({ message: "Chegirma saqlandi!" });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin: Kompaniyalar
app.get('/fuzz/api/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

app.post('/fuzz/api/admin/companies', async (c) => {
  try {
    const { name, logo, website, description } = await c.req.json();
    if (!isNameValid(name)) return c.json({ error: 'Taqiqlangan so\'zlar bor!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO companies (id, name, logo, website, description) VALUES (?, ?, ?, ?, ?)')
      .bind(id, name, logo, website, description).run();
      
    return c.json({ message: "Kompaniya qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin: Eventlarni olish (Vaqti o'tganlarni o'chirish va faqat aktivlarni ko'rsatish)
app.get('/fuzz/api/admin/events', async (c) => {
  try {
    // 1. Avval vaqti o'tgan eventlarni o'chirib tashlaymiz
    await c.env.DB.prepare('DELETE FROM events WHERE end_date < CURRENT_TIMESTAMP').run();

    // 2. Keyin qolgan barcha eventlarni qaytaramiz
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

// Admin: Event yaratish (Rejalashtirish)
app.post('/fuzz/api/admin/events', async (c) => {
  try {
    const { title, image, link_url, start_date, end_date } = await c.req.json();
    if (!title || !start_date || !end_date) return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);
    
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO events (id, title, image, link_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, title, image, link_url, start_date, end_date).run();
    return c.json({ message: "Event rejalashtirildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Public: Do'kondagi o'yinlar (chegirmalar bilan)
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

export default app;