-- QR orqali kirish sessiyalari
CREATE TABLE IF NOT EXISTS qr_sessions (
    token TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
