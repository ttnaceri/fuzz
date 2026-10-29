export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  apiBaseUrl: 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  // To'lov tizimi sozlamalari
  payment: {
    cardNumber: "5614 6818 8775 0416", // O'z karta raqamingiz
    cardHolder: "H. E.",
    exchangeApiUrl: "https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD"
  },

  // Telegram Bot sozlamalari
  telegram: {
    botToken: '8899661133:AAEZdm2KsSYQUpUdw3aDgp85mXdGeHzYGQ4',
    botUrl: 'https://t.me/FuzzAppBot',
    adminIds: ['6465879965'],
  },

  // Test (Demo) foydalanuvchilar uchun maxsus ma'lumotlar
  // DIQQAT: Bu faqat test uchun! Haqiqiy loyihada parollar backendda saqlanadi.
  testAccounts: {
    admin: {
      name: "admin",
      email: "fuzzadmin@gmail.com",
      password: "55668576he",
      role: "admin"
    },
    user: {
      name: "husniddin",
      email: "husniddin@gmail.com",
      password: "12344321",
      role: "user"
    }
  }
};