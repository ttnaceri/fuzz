CREATE TABLE IF NOT EXISTS telegram_users (
    telegram_id TEXT PRIMARY KEY,
    first_name TEXT,
    username TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, blocked
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);