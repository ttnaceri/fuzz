import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
  origin: ['https://fuzz-tau.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const BANNED_WORDS = ['fuck', 'xxx', 'porn', 'sex', 'shit', 'bitch'];
const isNameValid = (name) => {
  if (!name) return false;
  return !BANNED_WORDS.some(word => name.toLowerCase().includes(word));
};

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
    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) { return c.json({ error: "Xato: " + err.message }, 500); }
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

// Admin Users List
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin All Games
app.get('/fuzz/api/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Companies
app.get('/fuzz/api/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

// Admin Events
app.get('/fuzz/api/admin/events', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM events WHERE end_date < CURRENT_TIMESTAMP').run();
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

// ==========================================
// CONSOLE COMMANDS API (YANGI)
// ==========================================
app.post('/fuzz/api/admin/console', async (c) => {
  try {
    const { command } = await c.req.json();
    if (!command) return c.json({ error: 'Buyruq kiritilmadi' }, 400);

    const parts = command.trim().split(/\s+/);
    const action = parts[0].toLowerCase();
    
    let response = '';

    // 1. KILL (User yoki O'yinni o'chirish)
    if (action === 'kill') {
      const target = parts[1];
      if (!target) return c.json({ error: 'Kimni yoki nimani o\'chirish kerakligini kiriting' }, 400);
      
      if (target.toLowerCase() === 'all') {
        await c.env.DB.prepare('DELETE FROM users WHERE role != "admin"').run();
        response = "Barcha oddiy foydalanuvchilar o'chirildi.";
      } else {
        // Username yoki GameID ekanligini tekshirish
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(target).first();
        if (user) {
          await c.env.DB.prepare('DELETE FROM users WHERE username = ?').bind(target).run();
          response = `Foydalanuvchi ${target} o'chirildi.`;
        } else {
          const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(target).first();
          if (game) {
            await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(target).run();
            response = `O'yin ${target} o'chirildi.`;
          } else {
            response = `"${target}" nomli foydalanuvchi yoki o'yin topilmadi.`;
          }
        }
      }
    }
    
    // 2. GIVE (Pul yoki O'yin berish)
    else if (action === 'give') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];

      if (!targetUser) return c.json({ error: 'Foydalanuvchini kiriting' }, 400);

      if (amount && !isNaN(amount)) {
        // Pul berish (give user USD 100)
        await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} ga $${amount} qo'shildi.`;
      } else {
        // O'yin berish (give user GameID)
        const gameId = typeOrId;
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(targetUser).first();
        if (!user) return c.json({ error: 'Foydalanuvchi topilmadi' }, 404);
        
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO user_library (id, user_id, game_id) VALUES (?, ?, ?)').bind(id, user.id, gameId).run();
        response = `${targetUser} ga o'yin (${gameId}) qo'shildi.`;
      }
    }

    // 3. TAKE (Pul yoki O'yinni tortib olish)
    else if (action === 'take') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];

      if (amount && !isNaN(amount)) {
        await c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} dan $${amount} ayirildi.`;
      } else {
        response = `${targetUser} dan o'yin olib tashlandi.`;
      }
    }

    // 4. DISCOUNT (Chegirma)
    else if (action === 'discount') {
      const gameId = parts[1];
      const percent = parseInt(parts[2]);
      if (percent < 10 || percent > 95) return c.json({ error: 'Chegirma 10% dan 95% gacha bo\'lishi kerak!' }, 400);
      
      await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(percent, gameId).run();
      response = `${gameId} o'yiniga ${percent}% chegirma qo'llanildi.`;
    }

    // 5. NEWNAME (Yangi user yaratish)
    else if (action === 'newname' || action === 'newuser') {
      const newName = parts[1];
      const newBalance = parseFloat(parts[2]) || 0;
      
      if (!newName || !isNameValid(newName)) return c.json({ error: 'Nom noto\'g\'ri yoki taqiqlangan!' }, 400);
      
      const id = crypto.randomUUID();
      await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, newName, `${newName}@temp.com`, '123456', 'user', newBalance).run();
      response = `${newName} nomli foydalanuvchi yaratildi. Balans: $${newBalance}`;
    }

    // 6. NEWUPD (Rolni o'zgartirish)
    else if (action === 'newupd') {
      const username = parts[1];
      const newRole = parts[2];
      
      await c.env.DB.prepare('UPDATE users SET role = ? WHERE username = ?').bind(newRole, username).run();
      response = `${username} ning roli ${newRole} ga o'zgartirildi.`;
    }

    // 7. BAN (Bloklash)
    else if (action === 'ban') {
      const username = parts[1];
      const reason = parts.slice(2).join(' ') || 'Sababsiz';
      
      await c.env.DB.prepare('UPDATE users SET role = "banned" WHERE username = ?').bind(username).run();
      response = `${username} bloklandi. Sabab: ${reason}`;
    }

    // 8. UNBAN (Blokdan chiqarish)
    else if (action === 'unban') {
      const username = parts[1];
      await c.env.DB.prepare('UPDATE users SET role = "user" WHERE username = ?').bind(username).run();
      response = `${username} blokdan chiqarildi.`;
    }

    // 9. HELP
    else if (action === 'help') {
      response = 'kill, give, take, discount, newName, newUpd, ban, unBan, open, clear, exit';
    }

    return c.json({ message: response });

  } catch (err) {
    return c.json({ error: 'Buyruqni bajarishda xato: ' + err.message }, 500);
  }
});

export default app;