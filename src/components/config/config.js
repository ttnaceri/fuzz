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
    cardNumber: import.meta.env.VITE_CARD_NUMBER || '5614 6818 8775 0416',
    cardHolder: import.meta.env.VITE_CARD_HOLDER || 'H. E.',
    // Vercel'dan API kalitni o'qiymiz (Agar mavjud bo'lsa)
    exchangeApiKey: import.meta.env.VITE_EXCHANGE_API_KEY || '',
    exchangeApiUrl: 'https://v6.exchangerate-api.com/v6/latest/USD', // Fallback
  },

  qrLogin: {
    path: '/qr-auth',
  },

  telegram: {
    botUrl: import.meta.env.VITE_TELEGRAM_BOT_URL || DEFAULT_TELEGRAM_BOT_URL,
  },
};