// Bu fayl GitHub'ga yuboriladi (maxfiy ma'lumot yo'q).
// Vercel build vaqtida avtomatik config.js ga nusxalanadi.

export const config = {
  appName: 'Fuzz',
  appVersion: '0.0.98',

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '',

  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  payment: {
    cardNumber: import.meta.env.VITE_CARD_NUMBER || '0000 0000 0000 0000',
    cardHolder: import.meta.env.VITE_CARD_HOLDER || 'Fuzz Admin',
    exchangeApiUrl: import.meta.env.VITE_EXCHANGE_API || 'https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/USD',
  },

  telegram: {
    botUrl: 'https://t.me/FuzzAppBot',
  },
};

export default config;