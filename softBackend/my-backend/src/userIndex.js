import { Hono } from 'hono';

const userApp = new Hono();

// User Library
userApp.get('/users/:userId/library', async (c) => {
  try {
    const library = await c.env.DB.prepare(`
      SELECT g.* FROM games g
      JOIN user_library ul ON g.id = ul.game_id
      WHERE ul.user_id = ?
    `).bind(c.req.param('userId')).all();
    return c.json({ games: library.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

// Buy Game
userApp.post('/store/buy', async (c) => {
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

// Pay with Stars
userApp.post('/store/pay-stars', async (c) => {
  try {
    const { userId, amount_usd, stars_paid } = await c.req.json();
    if (!userId || !amount_usd || !stars_paid) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    if (!user) return c.json({ error: 'Foydalanuvchi topilmadi' }, 404);

    await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(parseFloat(amount_usd), userId).run();
    
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO payments (id, user_id, amount_usd, stars_paid) VALUES (?, ?, ?, ?)').bind(id, userId, parseFloat(amount_usd), parseInt(stars_paid)).run();

    return c.json({ message: "To'lov muvaffaqiyatli amalga oshirildi!", newBalance: user.balance + parseFloat(amount_usd) });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Play Game
userApp.get('/games/:id/play', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT game_url FROM games WHERE id = ?').bind(c.req.param('id')).first();
    return game ? c.json({ game_url: game.game_url }) : c.json({ error: 'O\'yin topilmadi' }, 404);
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Track Time
userApp.post('/games/track-time', async (c) => {
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

// Public Games, Companies, Events
userApp.get('/games', async (c) => {
  try {
    const companyId = c.req.query('companyId');
    let query = 'SELECT * FROM games WHERE available = 1';
    let params = [];
    if (companyId) { query += ' AND company_id = ?'; params.push(companyId); }
    const games = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ games: [] }); }
});

userApp.get('/games/:id', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(c.req.param('id')).first();
    if (!game) return c.json({ error: 'O\'yin topilmadi' }, 404);
    return c.json({ game });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

userApp.get('/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

userApp.get('/events', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM events WHERE end_date < CURRENT_TIMESTAMP').run();
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

export default userApp;