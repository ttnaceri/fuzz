import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 1. Health Check
app.get('/fuzz/api/health', (c) => c.json({ status: 'ok' }));

// 2. Admin Stats
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    return c.json({ users: usersCount.c || 0, games: gamesCount.c || 0, revenue: 0 });
  } catch (err) {
    return c.json({ error: 'Statistika olishda xato' }, 500);
  }
});

// 3. Admin Users
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) {
    return c.json({ error: 'Foydalanuvchilarni olishda xato' }, 500);
  }
});

// 4. Admin Games
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) {
    return c.json({ error: 'O\'yinlarni olishda xato' }, 500);
  }
});

// 5. Admin Events
app.get('/fuzz/api/admin/events', async (c) => {
  try {
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) {
    return c.json({ events: [] });
  }
});

// 6. Admin Companies
app.get('/fuzz/api/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) {
    return c.json({ companies: [] });
  }
});

// 7. Games (Public)
app.get('/fuzz/api/games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games WHERE available = 1').all();
    return c.json({ games: games.results || [] });
  } catch (err) {
    return c.json({ games: [] });
  }
});

// 8. Auth Login
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
  } catch (err) { return c.json({ error: 'Serverda xatolik' }, 500); }
});

export default app;