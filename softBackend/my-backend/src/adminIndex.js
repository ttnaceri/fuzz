import { Hono } from 'hono';

const adminApp = new Hono();

// Admin Stats
adminApp.get('/admin/stats', async (c) => {
  try {
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const gamesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM games').first();
    const bundlesCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM bundles').first();
    const eventsCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM events').first();
    const totalBalance = await c.env.DB.prepare('SELECT SUM(balance) as sum FROM users').first();
    return c.json({
      users: usersCount?.c || 0,
      games: gamesCount?.c || 0,
      bundles: bundlesCount?.c || 0,
      events: eventsCount?.c || 0,
      revenue: totalBalance?.sum || 0
    });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

// Admin Payments
adminApp.get('/admin/payments', async (c) => {
  try {
    const payments = await c.env.DB.prepare('SELECT * FROM payments').all();
    return c.json({ payments: payments.results || [] });
  } catch (err) { return c.json({ payments: [] }); }
});

// Admin Users (Barcha foydalanuvchilar)
adminApp.get('/admin/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, email, role, balance, telegram_id, language, created_at FROM users').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

// Admin Users: Qidirish (Username, Email yoki Telegram ID orqali)
adminApp.get('/admin/users/search', async (c) => {
  try {
    const query = c.req.query('q');
    if (!query) return c.json({ users: [] });

    const users = await c.env.DB.prepare(
      'SELECT id, username, email, role, balance, telegram_id, language, created_at FROM users WHERE username LIKE ? OR email LIKE ? OR telegram_id LIKE ?'
    ).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
    
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

// Admin Users: Tahrirlash
adminApp.put('/admin/users/:id', async (c) => {
  try {
    const { username, email, balance, role, telegram_id } = await c.req.json();
    if (email) {
      const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(email, c.req.param('id')).first();
      if (existing) return c.json({ error: 'Bu email band!' }, 409);
    }
    await c.env.DB.prepare('UPDATE users SET username = ?, email = ?, balance = ?, role = ?, telegram_id = ? WHERE id = ?')
      .bind(username, email || null, parseFloat(balance), role, telegram_id || null, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato: ' + err.message }, 500); }
});

adminApp.delete('/admin/users/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Companies
adminApp.get('/admin/companies', async (c) => {
  try {
    const companies = await c.env.DB.prepare('SELECT * FROM companies').all();
    return c.json({ companies: companies.results || [] });
  } catch (err) { return c.json({ companies: [] }); }
});

adminApp.post('/admin/companies', async (c) => {
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

adminApp.put('/admin/companies/:id', async (c) => {
  try {
    const { name, logo, website, description } = await c.req.json();
    const safeLogo = (logo && logo.length > 2000) ? logo.substring(0, 2000) : (logo || '');
    await c.env.DB.prepare('UPDATE companies SET name = ?, logo = ?, website = ?, description = ? WHERE id = ?')
      .bind(name, safeLogo, website || '', description || '', c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin Games
adminApp.get('/admin/all-games', async (c) => {
  try {
    const games = await c.env.DB.prepare('SELECT * FROM games').all();
    return c.json({ games: games.results || [] });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

adminApp.post('/admin/games', async (c) => {
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

adminApp.put('/admin/games/:id', async (c) => {
  try {
    const { title, price, genre, image, game_url, discount } = await c.req.json();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    await c.env.DB.prepare('UPDATE games SET title = ?, price = ?, genre = ?, image = ?, game_url = ?, discount = ? WHERE id = ?')
      .bind(title, parseFloat(price), genre, safeImage, game_url, parseInt(discount) || 0, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/games/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM games WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Bundles
adminApp.get('/admin/bundles', async (c) => {
  try {
    const bundles = await c.env.DB.prepare('SELECT * FROM bundles').all();
    return c.json({ bundles: bundles.results || [] });
  } catch (err) { return c.json({ bundles: [] }); }
});

adminApp.post('/admin/bundles', async (c) => {
  try {
    const { name, description, image, price, discount } = await c.req.json();
    if (!name || !price) return c.json({ error: 'Nom va Narxni kiriting!' }, 400);
    const id = crypto.randomUUID();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    await c.env.DB.prepare('INSERT INTO bundles (id, name, description, image, price, discount) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, name, description || '', safeImage, parseFloat(price), parseInt(discount) || 0).run();
    return c.json({ message: "Bundle yaratildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.put('/admin/bundles/:id', async (c) => {
  try {
    const { name, description, image, price, discount } = await c.req.json();
    const safeImage = (image && image.length > 2000) ? image.substring(0, 2000) : (image || '');
    await c.env.DB.prepare('UPDATE bundles SET name = ?, description = ?, image = ?, price = ?, discount = ? WHERE id = ?')
      .bind(name, description || '', safeImage, parseFloat(price), parseInt(discount) || 0, c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/bundles/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM bundles WHERE id = ?').bind(c.req.param('id')).run();
    await c.env.DB.prepare('DELETE FROM bundle_games WHERE bundle_id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

adminApp.post('/admin/bundles/:id/games', async (c) => {
  try {
    const { gameId } = await c.req.json();
    if (!gameId) return c.json({ error: 'O\'yin ID sini kiriting!' }, 400);
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO bundle_games (id, bundle_id, game_id) VALUES (?, ?, ?)')
      .bind(id, c.req.param('id'), gameId).run();
    return c.json({ message: "O'yin bundlega qo'shildi!" }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin Events
adminApp.get('/admin/events', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM events WHERE end_date < CURRENT_TIMESTAMP').run();
    const events = await c.env.DB.prepare('SELECT * FROM events').all();
    return c.json({ events: events.results || [] });
  } catch (err) { return c.json({ events: [] }); }
});

adminApp.post('/admin/events', async (c) => {
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

// Admin API Keys
adminApp.get('/admin/api-keys', async (c) => {
  try {
    const keys = await c.env.DB.prepare('SELECT * FROM api_keys').all();
    return c.json({ keys: keys.results || [] });
  } catch (err) { return c.json({ keys: [] }); }
});

adminApp.post('/admin/api-keys', async (c) => {
  try {
    const { description, permissions, expires_at } = await c.req.json();
    const id = crypto.randomUUID();
    const keyValue = 'fz_live_' + crypto.randomUUID().replace(/-/g, '');
    await c.env.DB.prepare('INSERT INTO api_keys (id, key_value, description, permissions, expires_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, keyValue, description || '', permissions || '', expires_at || null).run();
    return c.json({ message: "API Key yaratildi!", key: keyValue }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/api-keys/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM api_keys WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Webhooks
adminApp.get('/admin/webhooks', async (c) => {
  try {
    const webhooks = await c.env.DB.prepare('SELECT * FROM webhooks').all();
    return c.json({ webhooks: webhooks.results || [] });
  } catch (err) { return c.json({ webhooks: [] }); }
});

adminApp.post('/admin/webhooks', async (c) => {
  try {
    const { name, url, event_type, secret } = await c.req.json();
    if (!name || !url) return c.json({ error: 'Nom va URL ni kiriting!' }, 400);
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO webhooks (id, name, url, event_type, secret) VALUES (?, ?, ?, ?, ?)')
      .bind(id, name, url, event_type || 'all', secret || '').run();
    return c.json({ message: "Webhook yaratildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/webhooks/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM webhooks WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Backend
adminApp.get('/admin/backend', async (c) => {
  try {
    const services = await c.env.DB.prepare('SELECT * FROM backend_services').all();
    return c.json({ services: services.results || [] });
  } catch (err) { return c.json({ services: [] }); }
});

adminApp.post('/admin/backend', async (c) => {
  try {
    const { name, url, status } = await c.req.json();
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO backend_services (id, name, url, status) VALUES (?, ?, ?, ?)')
      .bind(id, name, url, status || 'active').run();
    return c.json({ message: "Xizmat qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin Roles
adminApp.get('/admin/roles', async (c) => {
  try {
    const roles = await c.env.DB.prepare('SELECT * FROM roles').all();
    return c.json({ roles: roles.results || [] });
  } catch (err) { return c.json({ roles: [] }); }
});

adminApp.post('/admin/roles', async (c) => {
  try {
    const { name, description, permissions } = await c.req.json();
    if (!name) return c.json({ error: 'Rol nomini kiriting!' }, 400);
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)')
      .bind(id, name, description || '', JSON.stringify(permissions || [])).run();
    return c.json({ message: "Rol yaratildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.put('/admin/roles/:id', async (c) => {
  try {
    const { name, description, permissions } = await c.req.json();
    await c.env.DB.prepare('UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?')
      .bind(name, description || '', JSON.stringify(permissions || []), c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/roles/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM roles WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Rates
adminApp.get('/admin/rates', async (c) => {
  try {
    const rates = await c.env.DB.prepare('SELECT * FROM rates').all();
    return c.json({ rates: rates.results || [] });
  } catch (err) { return c.json({ rates: [] }); }
});

adminApp.post('/admin/rates', async (c) => {
  try {
    const { currency, rate, source } = await c.req.json();
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO rates (id, currency, rate, source) VALUES (?, ?, ?, ?)')
      .bind(id, currency, parseFloat(rate), source || 'manual').run();
    return c.json({ message: "Kurs saqlandi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

// Admin Stars Rates
adminApp.get('/admin/stars-rates', async (c) => {
  try {
    const rates = await c.env.DB.prepare('SELECT * FROM stars_rates').all();
    return c.json({ rates: rates.results || [] });
  } catch (err) { return c.json({ rates: [] }); }
});

adminApp.post('/admin/stars-rates', async (c) => {
  try {
    const { amount_usd, stars_amount } = await c.req.json();
    if (!amount_usd || !stars_amount) return c.json({ error: 'Barcha maydonlarni to\'ldiring!' }, 400);
    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO stars_rates (id, amount_usd, stars_amount) VALUES (?, ?, ?)')
      .bind(id, parseFloat(amount_usd), parseInt(stars_amount)).run();
    return c.json({ message: "Kurs qo'shildi!", id }, 201);
  } catch (err) { return c.json({ error: 'Server xatosi' }, 500); }
});

adminApp.delete('/admin/stars-rates/:id', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM stars_rates WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Admin Server
adminApp.get('/admin/server', async (c) => {
  try {
    return c.json({
      status: 'online',
      uptime: '99.9%',
      cpu: Math.floor(Math.random() * 30) + 20,
      ram: Math.floor(Math.random() * 40) + 40,
      storage: Math.floor(Math.random() * 20) + 60,
      api_requests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 5),
    });
  } catch (err) { return c.json({ error: 'Xato' }, 500); }
});

// Telegram Support (Barcha telegram_id bo'lgan userlar)
adminApp.get('/admin/telegram/users', async (c) => {
  try {
    const users = await c.env.DB.prepare('SELECT id, username, telegram_id, balance, created_at FROM users WHERE telegram_id IS NOT NULL').all();
    return c.json({ users: users.results || [] });
  } catch (err) { return c.json({ users: [] }); }
});

export default adminApp;