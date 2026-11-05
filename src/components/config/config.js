export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  apiBaseUrl: 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  payment: {
    cardNumber: "5614 6818 8775 0416",
    cardHolder: "H. E.",
    exchangeApiUrl: "https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD"
  },

  qrLogin: {
    scanUrl: 'https://fuzz-tau.vercel.app/qr-auth' 
  },

  telegram: {
    botUrl: 'https://t.me/FuzzAppBot'
  }
};