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

// DB Init (Barcha jadvallar, shu jumladan reset_codes)
app.get('/fuzz/api/init-db', async (c) => {
  try {
    // 1. Foydalanuvchilar
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, role TEXT DEFAULT 'user', balance REAL DEFAULT 0,
        telegram_id TEXT, language TEXT DEFAULT 'uz', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 2. Kompaniyalar
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, 
        website TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 3. O'yinlar
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, price REAL DEFAULT 0, genre TEXT,
        image TEXT, game_url TEXT, company_id TEXT, available INTEGER DEFAULT 1, 
        discount INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 4. Eventlar
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, image TEXT, link_url TEXT, 
        start_date DATETIME, end_date DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 5. Foydalanuvchi kutubxonasi
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_library (
        id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 6. Rasmlar (Base64)
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY, base64_data TEXT NOT NULL, mime_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 7. O'yin statistikasi
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id TEXT PRIMARY KEY, user_id TEXT, game_id TEXT, total_seconds INTEGER DEFAULT 0, 
        last_played DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 8. Parolni tiklash kodlari (YANGI)
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS reset_codes (
        id TEXT PRIMARY KEY, username TEXT, code TEXT, expires_at DATETIME
      );
    `).run();

    return c.json({ message: "Barcha jadvallar yaratildi!" });
  } catch (err) {
    return c.json({ error: "Xato: " + err.message }, 500);
  }
});

// ==========================================
// RASM YUKLASH VA KO'RSATISH
// ==========================================
app.post('/fuzz/api/upload', async (c) => {
  try {
    const { base64, mimeType } = await c.req.json();
    if (!base64) return c.json({ error: 'Rasm ma\'lumotlari topilmadi' }, 400);
    if (base64.length > 1500000) return c.json({ error: 'Rasm hajmi juda katta! (Max 1MB)' }, 400);

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO images (id, base64_data, mime_type) VALUES (?, ?, ?)')
      .bind(id, base64, mimeType || 'image/jpeg').run();

    return c.json({ message: 'Rasm yuklandi!', url: `/api/images/${id}` }, 201);
  } catch (err) { return c.json({ error: 'Rasm yuklashda xato' }, 500); }
});

app.get('/fuzz/api/images/:id', async (c) => {
  try {
    const image = await c.env.DB.prepare('SELECT base64_data, mime_type FROM images WHERE id = ?').bind(c.req.param('id')).first();
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

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/fuzz/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

    if (!user && username === 'admin' && password === '55668576he') {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').bind(id, username, 'admin@fuzz.store', password, 'admin').run();
        user = { id, username, role: 'admin', balance: 0 };
    }

    if (!user || user.password !== password) return c.json({ error: 'Parol yoki username xato!' }, 401);
    return c.json({ user: { id: user.id, username: user.username, role: user.role, balance: user.balance || 0 } });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

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
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Telegram ID Check
app.post('/fuzz/api/auth/check-telegram', async (c) => {
  try {
    const { telegramId } = await c.req.json();
    if (!telegramId) return c.json({ error: 'Telegram ID kiritilmadi' }, 400);
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(telegramId).first();
    if (!user) return c.json({ error: 'Bu Telegram ID bilan ro\'yxatdan o\'tilmagan. Iltimos, avval botga /start bosing.' }, 404);
    return c.json({ message: 'Telegram ID tasdiqlandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Reset Password APIs
app.post('/fuzz/api/auth/reset-request', async (c) => {
  try {
    const { username, email, passwordEnd } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? AND email = ?').bind(username, email).first();
    if (!user) return c.json({ error: 'Bunday foydalanuvchi topilmadi!' }, 404);
    if (passwordEnd && user.password.slice(-2) !== passwordEnd) return c.json({ error: 'Parolning oxirgi 2 belgisi xato!' }, 400);

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await c.env.DB.prepare('INSERT INTO reset_codes (id, username, code, expires_at) VALUES (?, ?, ?, ?)').bind(id, username, code, expiresAt).run();

    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (BOT_TOKEN && user.telegram_id) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: user.telegram_id, text: `Fuzz parolni tiklash kodi: ${code}\n\nKod 10 daqiqa amal qiladi.` })
      });
    }
    return c.json({ message: 'Kod yuborildi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-verify', async (c) => {
  try {
    const { username, code } = await c.req.json();
    const record = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE username = ? AND code = ? ORDER BY expires_at DESC LIMIT 1').bind(username, code).first();
    if (!record) return c.json({ error: 'Kod xato!' }, 400);
    if (new Date(record.expires_at) < new Date()) return c.json({ error: 'Kod muddati o\'tgan!' }, 400);
    return c.json({ message: 'Kod tasdiqlandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.post('/fuzz/api/auth/reset-password', async (c) => {
  try {
    const { username, code, newPassword } = await c.req.json();
    const record = await c.env.DB.prepare('SELECT * FROM reset_codes WHERE username = ? AND code = ?').bind(username, code).first();
    if (!record) return c.json({ error: 'Ruxsatsiz so\'rov!' }, 403);
    await c.env.DB.prepare('UPDATE users SET password = ? WHERE username = ?').bind(newPassword, username).run();
    await c.env.DB.prepare('DELETE FROM reset_codes WHERE username = ?').bind(username).run();
    return c.json({ message: 'Parol yangilandi!' });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// ==========================================
// ADMIN STATISTICS
// ==========================================
app.get('/fuzz/api/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    return c.json({ users: usersCount.c || 0, games: gamesCount.c || 0, revenue: 0 });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// ADMIN USERS MANAGEMENT
// ==========================================
app.get('/fuzz/api/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.delete('/fuzz/api/admin/users/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.put('/fuzz/api/admin/users/:id/role', async (c) => {
  try {
    const { role } = await c.req.json();
    await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// COMPANIES API
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
    const safeLogo = (logo && logo.length > 2000) ? logo.substring(0, 2000) : (logo || '');
    await c.env.DB.prepare('INSERT INTO companies (id, name, logo, website, description) VALUES (?, ?, ?, ?, ?)')
      .bind(id, name, safeLogo, website || '', description || '').run();
    return c.json({ message: "Kompaniya qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.get('/fuzz/api/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

// ==========================================
// GAMES API
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
    if (!title || !price || !game_url || !company_id) return c.json({ error: 'Majburiy maydonlarni to\'ldiring!' }, 400);
    const id = crypto.randomUUID();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    await c.env.DB.prepare('INSERT INTO games (id, title, price, genre, image, game_url, company_id, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, title, parseFloat(price), genre || '', safeImage, game_url, company_id, 1).run();
    return c.json({ message: "O'yin saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

app.delete('/fuzz/api/admin/games/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.put('/fuzz/api/admin/games/:id/discount', async (c) => {
  try {
    const { discount } = await c.req.json();
    if (discount < 10 || discount > 95) return c.json({ error: 'Chegirma 10% dan 95% gacha bo\'lishi shart!' }, 400);
    await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(discount, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.get('/fuzz/api/games', async (c) => {
  try {
    const companyId = c.req.query('companyId');
    let query = 'SELECT * FROM games WHERE available = 1';
    let params = [];
    if (companyId) { query += ' AND company_id = ?'; params.push(companyId); }
    const games = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

app.get('/fuzz/api/games/:id', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(c.req.param('id')).first();
    if (!game) return c.json({ error: 'O\'yin topilmadi' }, 404);
    return c.json({ game });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// EVENTS API
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
    if (!title || !start_date || !end_date) return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);
    const id = crypto.randomUUID();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    await c.env.DB.prepare('INSERT INTO events (id, title, image, link_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, title, safeImage, link_url || '', start_date, end_date).run();
    return c.json({ message: "Event qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// ==========================================
// STORE & LIBRARY
// ==========================================
app.post('/fuzz/api/store/buy', async (c) => {
  try {
    const { userId, gameId } = await c.req.json();
    if (!userId || !gameId) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);
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
    const library = await c.env.DB.prepare(`
      SELECT g.* FROM games g
      JOIN user_library ul ON g.id = ul.game_id
      WHERE ul.user_id = ?
    `).bind(c.req.param('userId')).all();
    return c.json({ games: library.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

app.get('/fuzz/api/games/:id/play', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT game_url FROM games WHERE id = ?').bind(c.req.param('id')).first();
    return game ? c.json({ game_url: game.game_url }) : c.json({ error: 'O\'yin topilmadi' }, 404);
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

app.post('/fuzz/api/games/track-time', async (c) => {
  try {
    const { userId, gameId, seconds } = await c.req.json();
    if (!userId || !gameId || !seconds) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);
    const existing = await c.env.DB.prepare('SELECT * FROM game_stats WHERE user_id = ? AND game_id = ?').bind(userId, gameId).first();
    if (existing) {
      await c.env.DB.prepare('UPDATE game_stats SET total_seconds = total_seconds + ?, last_played = CURRENT_TIMESTAMP WHERE id = ?').bind(seconds, existing.id).run();
    } else {
      await c.env.DB.prepare('INSERT INTO game_stats (id, user_id, game_id, total_seconds) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), userId, gameId, seconds).run();
    }
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// ==========================================
// ADMIN CONSOLE COMMANDS
// ==========================================
app.post('/fuzz/api/admin/console', async (c) => {
  try {
    const { command } = await c.req.json();
    if (!command) return c.json({ error: 'Buyruq kiritilmadi' }, 400);

    const parts = command.trim().split(/\s+/);
    const action = parts[0].toLowerCase();
    let response = '';

    if (action === 'kill') {
      const target = parts[1];
      if (target === 'all') {
        await c.env.DB.prepare('DELETE FROM users WHERE role != "admin"').run();
        response = "Barcha oddiy foydalanuvchilar o'chirildi.";
      } else {
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(target).first();
        if (user) {
          await c.env.DB.prepare('DELETE FROM users WHERE username = ?').bind(target).run();
          response = `Foydalanuvchi ${target} o'chirildi.`;
        } else {
          await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(target).run();
          response = `O'yin ${target} o'chirildi.`;
        }
      }
    } else if (action === 'give') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];
      if (amount && !isNaN(amount)) {
        await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} ga $${amount} qo'shildi.`;
      } else {
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(targetUser).first();
        if (!user) return c.json({ error: 'Foydalanuvchi topilmadi' }, 404);
        await c.env.DB.prepare('INSERT INTO user_library (id, user_id, game_id) VALUES (?, ?, ?)').bind(crypto.randomUUID(), user.id, typeOrId).run();
        response = `${targetUser} ga o'yin qo'shildi.`;
      }
    } else if (action === 'take') {
      const targetUser = parts[1];
      const typeOrId = parts[2];
      const amount = parts[3];
      if (amount && !isNaN(amount)) {
        await c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE username = ?').bind(parseFloat(amount), targetUser).run();
        response = `${targetUser} dan $${amount} ayirildi.`;
      } else {
        response = `${targetUser} dan o'yin olib tashlandi.`;
      }
    } else if (action === 'discount') {
      const gameId = parts[1];
      const percent = parseInt(parts[2]);
      if (percent < 10 || percent > 95) return c.json({ error: 'Chegirma 10% dan 95% gacha bo\'lishi kerak!' }, 400);
      await c.env.DB.prepare('UPDATE games SET discount = ? WHERE id = ?').bind(percent, gameId).run();
      response = `Chegirma qo'llanildi.`;
    } else if (action === 'newname' || action === 'newuser') {
      const newName = parts[1];
      const newBalance = parseFloat(parts[2]) || 0;
      if (!newName || !isNameValid(newName)) return c.json({ error: 'Nom noto\'g\'ri!' }, 400);
      const id = crypto.randomUUID();
      await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)').bind(id, newName, `${newName}@temp.com`, '123456', 'user', newBalance).run();
      response = `${newName} yaratildi.`;
    } else if (action === 'newupd') {
      const username = parts[1];
      const newRole = parts[2];
      await c.env.DB.prepare('UPDATE users SET role = ? WHERE username = ?').bind(newRole, username).run();
      response = `${username} ning roli ${newRole} ga o'zgartirildi.`;
    } else if (action === 'ban') {
      const username = parts[1];
      await c.env.DB.prepare('UPDATE users SET role = "banned" WHERE username = ?').bind(username).run();
      response = `${username} bloklandi.`;
    } else if (action === 'unban') {
      const username = parts[1];
      await c.env.DB.prepare('UPDATE users SET role = "user" WHERE username = ?').bind(username).run();
      response = `${username} blokdan chiqarildi.`;
    } else if (action === 'help') {
      response = 'kill, give, take, discount, newName, newUpd, ban, unBan, open, clear, exit';
    }

    return c.json({ message: response });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

// ==========================================
// TELEGRAM WEBHOOK
// ==========================================
app.post('/fuzz/telegram/webhook', async (c) => {
  try {
    const update = await c.req.json();
    const BOT_TOKEN = c.env.BOT_TOKEN;
    if (!BOT_TOKEN) return c.json({ error: 'Bot token yo\'q' }, 500);
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // /start bosilganda
    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name || 'User';
      const lastName = update.message.from.last_name || '';

      // Foydalanuvchini bazaga qo'shish (agar yo'q bo'lsa)
      const existing = await c.env.DB.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(chatId).first();
      if (!existing) {
        const id = crypto.randomUUID();
        await c.env.DB.prepare('INSERT INTO users (id, username, email, password, role, telegram_id) VALUES (?, ?, ?, ?, ?, ?)').bind(id, firstName + lastName, `${firstName}@temp.com`, '123456', 'user', chatId).run();
      }

      // Til tanlash tugmalarini yuborish
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Iltimos, tilingizni tanlang:\nPlease choose your language:\nПожалуйста, выберите ваш язык:",
          reply_markup: {
            inline_keyboard: [
              [ { text: "🇺🇿 Uzb", callback_data: "lang_uz" }, { text: "🇬🇧 Eng", callback_data: "lang_en" }, { text: "🇷🇺 Rus", callback_data: "lang_ru" } ]
            ]
          }
        }),
      });
    }

    // Til tanlanganda
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      if (data.startsWith('lang_')) {
        const lang = data.split('_')[1];
        const firstName = update.callback_query.from.first_name || 'User';
        const lastName = update.callback_query.from.last_name || '';

        await c.env.DB.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').bind(lang, chatId).run();

        let welcomeMessage = '';
        if (lang === 'uz') welcomeMessage = `Salom, ${firstName} ${lastName}!\nFuzz App botiga xush kelibsiz.\nID: ${chatId}\nBizni tanlaganingiz uchun rahmat.`;
        else if (lang === 'en') welcomeMessage = `Hi ${firstName} ${lastName}!\nWelcome to Fuzz App bot.\nID: ${chatId}\nThank you for choosing us.`;
        else if (lang === 'ru') welcomeMessage = `Привет, ${firstName} ${lastName}!\nДобро пожаловать в бот Fuzz App.\nID: ${chatId}\nСпасибо, что выбрали нас.`;

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            reply_markup: {
              inline_keyboard: [
                [ { text: "🚀 Fuzz App'ni ochish", web_app: { url: `https://fuzz-tau.vercel.app/register/form?tgId=${chatId}` } } ]
              ]
            }
          }),
        });
      }
    }

    return c.json({ ok: true });
  } catch (err) { return c.json({ error: 'Webhook xatosi' }, 500); }
});

export default app;