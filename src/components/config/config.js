export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  // Backend manzili
  apiBaseUrl: 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  // To'lov tizimi sozlamalari (KARTA RAQAMI SHU YERDA)
  payment: {
    cardNumber: "5614 6818 8775 0416",
    cardHolder: "H. E.",
    exchangeApiUrl: "https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD"
  },

  // QR Login sozlamalari
  qrLogin: {
    scanUrl: 'https://fuzz-tau.vercel.app/qr-auth' 
  },

  // Telegram Bot sozlamalari
  telegram: {
    botUrl: 'https://t.me/FuzzAppBot'
  }
};