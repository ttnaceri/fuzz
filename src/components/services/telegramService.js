import { api } from './api.js';

export const telegramService = {
  // Sayt profilidan Telegram akkauntni ulash
  async linkAccount(telegramId, code) {
    return api.post('/auth/link-telegram', { telegramId, code });
  },
  
  // Telegram orqali yuborilgan tasdiqlash kodini tekshirish
  async verifyCode(telegramId, code) {
    return api.post('/auth/verify-code', { telegramId, code });
  }
};