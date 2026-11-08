import { Hono } from 'hono';
import { getAuthUser, requireAuth, requireSelfOrAdmin, isAdminRole } from './middleware/auth.js';

const userApp = new Hono();

userApp.use('/users/:userId/*', requireSelfOrAdmin('userId'));
userApp.use('/store/*', requireAuth);
userApp.use('/wishlist', requireAuth);
userApp.use('/wishlist/*', requireAuth);
userApp.use('/games/track-time', requireAuth);

const stripUrl = ({ game_url, ...rest }) => rest;

// User Library
userApp.get('/users/:userId/library', async (c) => {
  try {
    const library = await c.env.DB.prepare(`
      SELECT g.* FROM games g
      JOIN user_library ul ON g.id = ul.game_id
      WHERE ul.user_id = ?
    `).bind(c.req.param('userId')).all();
    return c.json({ games: (library.results || []).map(stripUrl) });
  } catch (err) { return c.json({ games: [] }); }
});

// O'yin sotib olinganligini tekshirish
userApp.get('/users/:userId/owns/:gameId', async (c) => {
  try {
    const owned = await c.env.DB.prepare(
      'SELECT * FROM user_library WHERE user_id = ? AND game_id = ?'
    ).bind(c.req.param('userId'), c.req.param('gameId')).first();
    return c.json({ owned: !!owned });
  } catch (err) { return c.json({ owned: false }); }
});

// FAQAT USERNAME'NI YANGILASH
userApp.put('/users/:userId/username', async (c) => {
  try {
    const { username } = await c.req.json();
    const userId = c.req.param('userId');

    if (!username || username.trim().length < 3) {
      return c.json({ error: 'Username kamida 3 belgidan iborat bo\'lishi kerak!' }, 400);
    }

    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ? AND id != ?'
    ).bind(username.trim(), userId).first();

    if (existing) {
      return c.json({ error: 'Bu username band!' }, 409);
    }

    await c.env.DB.prepare('UPDATE users SET username = ? WHERE id = ?')
      .bind(username.trim(), userId).run();

    return c.json({ success: true, username: username.trim() });
  } catch (err) {
    return c.json({ error: 'Xato: ' + err.message }, 500);
  }
});

// Buy Game
userApp.post('/store/buy', async (c) => {
  try {
    const me = await getAuthUser(c);
    const { gameId } = await c.req.json();
    if (!gameId) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
    if (!game) return c.json({ error: 'Ma\'lumot topilmadi' }, 404);
    const owned = await c.env.DB.prepare('SELECT * FROM user_library WHERE user_id = ? AND game_id = ?').bind(me.id, gameId).first();
    if (owned) return c.json({ error: 'Sotib olingan!' }, 400);

    let finalPrice = Number(game.price) || 0;
    if (game.discount > 0) finalPrice = finalPrice - (finalPrice * (game.discount / 100));
    finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);

    const res = await c.env.DB.prepare('UPDATE users SET balance = ROUND(balance - ?, 2) WHERE id = ? AND balance >= ?')
      .bind(finalPrice, me.id, finalPrice).run();
    if (!res.meta?.changes) return c.json({ error: 'Balans yetarli emas!' }, 400);

    await c.env.DB.prepare('INSERT INTO user_library (id, user_id, game_id) VALUES (?, ?, ?)').bind(crypto.randomUUID(), me.id, gameId).run();
    const fresh = await c.env.DB.prepare('SELECT balance FROM users WHERE id = ?').bind(me.id).first();
    return c.json({ message: 'Sotib olindi!', newBalance: fresh?.balance ?? 0 });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// WISHLIST API'LARI
userApp.get('/users/:userId/wishlist', async (c) => {
  try {
    const wishlist = await c.env.DB.prepare(`
      SELECT g.* FROM games g
      JOIN user_wishlist uw ON g.id = uw.game_id
      WHERE uw.user_id = ?
    `).bind(c.req.param('userId')).all();
    return c.json({ games: (wishlist.results || []).map(stripUrl) });
  } catch (err) { return c.json({ games: [] }); }
});

userApp.post('/wishlist', async (c) => {
  try {
    const userId = (await getAuthUser(c)).id;
    const { gameId } = await c.req.json();
    if (!gameId) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);

    const existing = await c.env.DB.prepare('SELECT * FROM user_wishlist WHERE user_id = ? AND game_id = ?').bind(userId, gameId).first();
    if (existing) return c.json({ error: 'Allaqachon wishlistda!' }, 400);

    await c.env.DB.prepare('INSERT INTO user_wishlist (id, user_id, game_id) VALUES (?, ?, ?)')
      .bind(crypto.randomUUID(), userId, gameId).run();

    return c.json({ message: "Wishlistga qo'shildi!" });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

userApp.delete('/wishlist/:userId/:gameId', async (c) => {
  try {
    const me = await getAuthUser(c);
    if (me.id !== c.req.param('userId') && !isAdminRole(me.role)) return c.json({ error: 'Ruxsat yo\'q' }, 403);
    await c.env.DB.prepare('DELETE FROM user_wishlist WHERE user_id = ? AND game_id = ?')
      .bind(c.req.param('userId'), c.req.param('gameId')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Play Game
userApp.get('/games/:id/play', requireAuth, async (c) => {
  try {
    const me = await getAuthUser(c);
    const game = await c.env.DB.prepare('SELECT game_url, price, discount FROM games WHERE id = ?').bind(c.req.param('id')).first();
    if (!game) return c.json({ error: 'O\'yin topilmadi' }, 404);
    const isFree = !(Number(game.price) > 0) || Number(game.discount) >= 100;
    if (!isFree && !isAdminRole(me.role)) {
      const owned = await c.env.DB.prepare('SELECT id FROM user_library WHERE user_id = ? AND game_id = ?').bind(me.id, c.req.param('id')).first();
      if (!owned) return c.json({ error: 'Bu o\'yinni avval sotib oling' }, 403);
    }
    return c.json({ game_url: game.game_url });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Track Time
userApp.post('/games/track-time', async (c) => {
  try {
    const userId = (await getAuthUser(c)).id;
    const body = await c.req.json();
    const gameId = body.gameId;
    const seconds = Math.floor(Number(body.seconds));
    if (!gameId || !(seconds > 0) || seconds > 6 * 3600) return c.json({ error: 'Ma\'lumot yetarli emas' }, 400);
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
    return c.json({ games: (games.results || []).map(stripUrl) });
  } catch (err) { return c.json({ games: [] }); }
});

userApp.get('/games/:id', async (c) => {
  try {
    const game = await c.env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(c.req.param('id')).first();
    if (!game) return c.json({ error: 'O\'yin topilmadi' }, 404);
    return c.json({ game: stripUrl(game) });
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

// Public: Bundle ichidagi o'yinlar
userApp.get('/bundles/:id/games', async (c) => {
  try {
    const games = await c.env.DB.prepare(`
      SELECT g.* FROM games g
      JOIN bundle_games bg ON g.id = bg.game_id
      WHERE bg.bundle_id = ?
    `).bind(c.req.param('id')).all();
    return c.json({ games: (games.results || []).map(stripUrl) });
  } catch (err) { return c.json({ games: [] }); }
});

userApp.get('/bundles', async (c) => {
  try {
    const bundles = await c.env.DB.prepare('SELECT * FROM bundles').all();
    return c.json({ bundles: bundles.results || [] });
  } catch (err) { return c.json({ bundles: [] }); }
});

// ==========================================
// YANGI: PAYMENT REQUEST (KARTA ORQALI TO'LOV SO'ROVI)
// ==========================================
userApp.post('/payment-request', async (c) => {
  try {
    const me = await getAuthUser(c);
    if (!me) return c.json({ error: 'Avtorizatsiya kerak' }, 401);

    const { amount_uzs } = await c.req.json();
    if (!amount_uzs || Number(amount_uzs) <= 0) {
      return c.json({ error: 'Noto\'g\'ri miqdor' }, 400);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO payment_requests (id, user_id, amount_uzs, status) VALUES (?, ?, ?, ?)'
    ).bind(id, me.id, Number(amount_uzs), 'pending').run();

    return c.json({ success: true, message: 'To\'lov so\'rovi yuborildi', id }, 201);
  } catch (err) {
    return c.json({ error: 'Server xatosi: ' + err.message }, 500);
  }
});

export default userApp;