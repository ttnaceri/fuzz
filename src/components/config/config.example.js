export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  apiBaseUrl: 'https://YOUR_BACKEND/YOUR_PROJECTS_NAME',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  payment: {
    cardNumber: "0000 0000 0000 0000", 
    cardHolder: "Admin",
    exchangeApiUrl: "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD"
  },

  telegram: {
    botToken: 'YOUR_BOT_TOKEN_HERE',
    botUrl: 'https://t.me/YourBot',
    adminIds: [],
  },
  
  // Test akkauntlar frontendda emas, backendda bo'ladi.
  // Lekin Vercel build xato bermasligi uchun bo'sh obyekt qoldiramiz.
  testAccounts: {}
};