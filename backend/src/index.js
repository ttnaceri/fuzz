// ==========================================
// FUZZ: TELEGRAM AUTH API
// ==========================================

// 1. Ro'yxatdan o'tishni boshlash (register-init)
app.post('/fuzz/auth/register-init', async (c) => {
  try {
    const body = await c.req.json();
    const { telegramId, firstName, username } = body;

    if (!telegramId) {
      return c.json({ error: 'telegramId is required' }, 400);
    }

    // Bazada foydalanuvchi borligini tekshirish
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM telegram_users WHERE telegram_id = ?'
    ).bind(telegramId).first();

    if (existingUser) {
      return c.json({ 
        message: 'User already exists', 
        status: existingUser.status,
        user: existingUser 
      });
    }

    // Yangi foydalanuvchi yaratish
    await c.env.DB.prepare(
      'INSERT INTO telegram_users (telegram_id, first_name, username) VALUES (?, ?, ?)'
    ).bind(telegramId, firstName || '', username || '').run();

    return c.json({ 
      message: 'Registration initialized successfully', 
      status: 'pending' 
    }, 201);

  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// 2. Telegram bot orqali tasdiqlash holatini tekshirish (Sizning loglaringizda ko'ringan)
app.get('/fuzz/auth/verify-status', async (c) => {
  const telegramId = c.req.query('telegramId');

  if (!telegramId) {
    return c.json({ error: 'telegramId is required' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT status FROM telegram_users WHERE telegram_id = ?'
  ).bind(telegramId).first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ telegramId, status: user.status });
});

// 3. Bot tomonidan foydalanuvchini tasdiqlash (Admin uchun)
app.post('/fuzz/auth/verify', async (c) => {
  const body = await c.req.json();
  const { telegramId, action } = body; // action: 'approve' yoki 'block'

  if (!telegramId || !action) {
    return c.json({ error: 'Missing parameters' }, 400);
  }

  const status = action === 'approve' ? 'active' : 'blocked';

  const result = await c.env.DB.prepare(
    'UPDATE telegram_users SET status = ? WHERE telegram_id = ?'
  ).bind(status, telegramId).run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ message: `User status updated to ${status}` });
});