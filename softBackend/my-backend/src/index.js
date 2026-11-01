import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 1. CORS (Barcha domenlarga ruxsat - test uchun)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Taqiqlangan so'zlar (Kompaniya va O'yin nomlari uchun)
const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return !BANNED_WORDS.some(word => lowerName.includes(word));
};

// 2. Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 3. Database Init (Jadvallarni yaratish)
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

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Jadval yaratishda xato: " + err.message }, 500);
  }
});

// 4. AUTH (Login va Register)
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    // Standart admin yaratish
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

// 5. COMPANIES (Admin)
app.get('/fuzz/api/admin/companies', async (c) => {
  const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
  return c.json({ companies: companies.results || [] });
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

// 6. GAMES (Admin & User)
app.get('/fuzz/api/games', async (c) => {
  const companyId = c.req.query('companyId');
  let query = 'SELECT * FROM games WHERE available = 1';
  let params = [];
  
  if (companyId) {
    query += ' AND company_id = ?';
    params.push(companyId);
  }
  
  const games = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ games: games.results || [] });
});

app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url, company_id } = await c.req.json();
    
    if (!isNameValid(title)) return c.json({ error: 'O\'yin nomida taqiqlangan so\'zlar bor!' }, 400);
    if (!company_id) return c.json({ error: 'Kompaniyani tanlang!' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, company_id, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre, image, game_url, company_id, 1).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

export default app;