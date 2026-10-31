export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  // Backend API manzili
  apiBaseUrl: 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  // To'lov tizimi sozlamalari
  payment: {
    cardNumber: "5614 6818 8775 0416",
    cardHolder: "H. E.",
    exchangeApiUrl: "https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD"
  },

  // Telegram Bot (Faqat havola uchun kerak)
  telegram: {
    botUrl: 'https://t.me/FuzzAppBot'
  }
};