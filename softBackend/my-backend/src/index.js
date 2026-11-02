import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok' }));

// DB Init
app.get('/fuzz/api/init-db', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0, telegram_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, website TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT, image TEXT, game_url TEXT, company_id TEXT, available INTEGER DEFAULT 1, discount INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, start_date DATETIME, end_date DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_library (id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, base64_data TEXT NOT NULL, mime_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS game_stats (id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, total_seconds INTEGER DEFAULT 0, last_played DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
    
    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) { return c.json({ error: "Xato: " + err.message }, 500); }
});

// Rasm yuklash (Xatolarni ushlash bilan)
app.post('/fuzz/api/upload', async (c) => {
  try {
    const { base64, mimeType } = await c.req.json();
    if (!base64) return c.json({ error: 'Rasm ma\'lumotlari topilmadi' }, 400);

    // Rasm hajmi 1MB dan oshmasligi kerak (Base64 da bu ~1.3MB)
    if (base64.length > 1500000) {
      return c.json({ error: 'Rasm hajmi juda katta! (Max 1MB)' }, 400);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO images (id, base64_data, mime_type) VALUES (?, ?, ?)')
      .bind(id, base64, mimeType || 'image/jpeg').run();

    return c.json({ message: 'Rasm yuklandi!', url: `/api/images/${id}` }, 201);
  } catch (err) { 
    console.error("Upload xatosi:", err);
    return c.json({ error: 'Rasm yuklashda xato' }, 500); 
  }
});

app.get('/fuzz/api/images/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const image = await c.env.DB.prepare('SELECT base64_data, mime_type FROM images WHERE id = ?').bind(id).first();
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

// ==========================================
// COMPANIES (To'liq qayta yozildi)
// ==========================================
app.get('/fuzz/api/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

app.post('/fuzz/api/admin/companies', async (c) => {
  try {
    const { name, logo, website, description } = await c.req.json();
    if (!name) return c.json({ error: 'Kompaniya nomini kiriting!' }, 400);

    const id = crypto.randomUUID();
    
    // Logo uzunligini cheklash
    const safeLogo = (logo && logo.length > 2000) ? logo.substring(0, 2000) : (logo || '');
    
    await c.env.DB.prepare('INSERT INTO companies (id, name, logo, website, description) VALUES (?, ?, ?, ?, ?)')
      .bind(id, name, safeLogo, website || '', description || '').run();
      
    return c.json({ message: "Kompaniya qo'shildi!", id }, 201);
  } catch (err) { 
    console.error("Company xatosi:", err);
    return c.json({ error: 'Server xatosi: ' + err.message }, 500); 
  }
});

// Public Companies
app.get('/fuzz/api/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

// ==========================================
// GAMES (To'liq qayta yozildi)
// ==========================================
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.post('/fuzz/api/admin/games', async (c) => {
  try {
    const { title, price, genre, image, game_url, company_id } = await c.req.json();
    if (!title || !price || !game_url || !company_id) {
      return c.json({ error: 'Majburiy maydonlarni to\'ldiring!' }, 400);
    }

    const id = crypto.randomUUID();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, company_id, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre || '', safeImage, game_url, company_id, 1).run();
      
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { 
    console.error("Game xatosi:", err);
    return c.json({ error: 'Server xatosi: ' + err.message }, 500); 
  }
});

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

// ==========================================
// EVENTS (To'liq qayta yozildi)
// ==========================================
app.get('/fuzz/api/admin/events', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM events WHERE end_date < CURRENT_TIMESTAMP').run();
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

app.post('/fuzz/api/admin/events', async (c) => {
  try {
    const { title, image, link_url, start_date, end_date } = await c.req.json();
    if (!title || !start_date || !end_date) {
      return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);
    }

    const id = crypto.randomUUID();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    
    await c.env.DB.prepare('INSERT INTO events (id, title, image, link_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, title, safeImage, link_url || '', start_date, end_date).run();
      
    return c.json({ message: "Event qo'shildi!", id }, 201);
  } catch (err) { 
    console.error("Event xatosi:", err);
    return c.json({ error: 'Server xatosi: ' + err.message }, 500); 
  }
});

// Admin CRUD
app.delete('/fuzz/api/admin/users/:id', async (c) => {
  try { await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(c.req.param('id')).run(); return c.json({ success: true }); } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.put('/fuzz/api/admin/users/:id/role', async (c) => {
  try {
    const { role } = await c.req.json();
    await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.delete('/fuzz/api/admin/games/:id', async (c) => {
  try { await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(c.req.param('id')).run(); return c.json({ success: true }); } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.put('/fuzz/api/admin/games/:id/discount', async (c) => {
  try {
    const { discount } = await c.req.json();
    if (discount < 10 || discount > 95) return c.json({ error: '10-95 oralig\'ida!' }, 400);
    await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(discount, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Store & Library
app.post('/fuzz/api/store/buy', async (c) => {
  try {
    const { userId, gameId } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
    
    if (!user || !game) return c.json({ error: 'Ma\'lumot topilmadi' }, 404);

    const owned = await c.env.DB.prepare('SELECT * FROM user_library WHERE user_id = ? AND game_id = ?').bind(userId, gameId).first();
    if (owned) return c.json({ error: 'Sotib olingan!' }, 400);

    let finalPrice = game.price;
    if (game.discount > 0) finalPrice = game.price - (game.price * (game.discount / 100));
    if (user.balance < finalPrice) return c.json({ error: 'Balans yetarli emas!' }, 400);

    await c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(finalPrice, userId).run();
    await c.env.DB.prepare('INSERT INTO user_library (id, user_id, game_id) VALUES (?, ?, ?)').bind(crypto.randomUUID(), userId, gameId).run();

    return c.json({ message: 'Sotib olindi!', newBalance: user.balance - finalPrice });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.get('/fuzz/api/users/:userId/library', async (c) => {
  try {
    const library = await c.env.DB.prepare('SELECT g.* FROM games g JOIN user_library ul ON g.id = ul.game_id WHERE ul.user_id = ?').bind(c.req.param('userId')).all();
    return c.json({ games: library.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

app.get('/fuzz/api/games/:id/play', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT game_url FROM games WHERE id = ?').bind(c.req.param('id')).first();
    return game ? c.json({ game_url: game.game_url }) : c.json({ error: 'Topilmadi' }, 404);
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.post('/fuzz/api/games/track-time', async (c) => {
  try {
    const { userId, gameId, seconds } = await c.req.json();
    const existing = await c.env.DB.prepare('SELECT * FROM game_stats WHERE user_id = ? AND game_id = ?').bind(userId, gameId).first();
    if (existing) {
      await c.env.DB.prepare('UPDATE game_stats SET total_seconds = total_seconds + ? WHERE id = ?').bind(seconds, existing.id).run();
    } else {
      await c.env.DB.prepare('INSERT INTO game_stats (id, user_id, game_id, total_seconds) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), userId, gameId, seconds).run();
    }
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

export default app;