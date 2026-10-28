export const config = {
  appName: 'Fuzz',
  appVersion: '1.0.0',
  
  apiBaseUrl: 'https://my-backend.updbackend.workers.dev/fuzz',
  apiPrefix: '', 
  
  requestTimeout: 15000,
  defaultPageSize: 20,
  localManifestUrl: '/game/downloads.json',
  soundEnabled: false,

  // Telegram Bot sozlamalari
  telegram: {
    botToken: '8899661133:AAEZdm2KsSYQUpUdw3aDgp85mXdGeHzYGQ4', // @BotFather dan olingan token
    botUrl: 'https://t.me/FuzzAppBot', // Botning havolasi
    adminIds: ['6465879965'], // Adminlarning Telegram ID raqamlari
  }
};