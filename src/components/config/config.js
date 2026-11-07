// src/config/config.js
//
// ⚠️ BU FAYL FRONTEND BUNDLE'GA TUSHADI — MAXFIY KALIT YOZMANG!
// Maxfiy tokenlar (BOT_TOKEN, JWT_SECRET, EXCHANGE_RATE_API_KEY)
//   faqat backend (Cloudflare Workers) `wrangler secret` da saqlanadi.

const DEFAULT_API_BASE_URL = 'https://my-backend.updbackend.workers.dev/fuzz';
const DEFAULT_TELEGRAM_BOT_URL = 'https://t.me/FuzzAppBot';

export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  apiPrefix: '',

  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  payment: {
    cardNumber: '5614 6818 8775 0416',
    cardHolder: 'H. E.',
    // exchangeApiUrl OLIB TASHLANDI — kalit endi backend'da (wrangler secret)
  },

  qrLogin: {
    // Dinamik — window.location.origin. Hardcoded URL emas.
    path: '/qr-auth',
  },

  telegram: {
    botUrl: import.meta.env.VITE_TELEGRAM_BOT_URL || DEFAULT_TELEGRAM_BOT_URL,
  },
};