import { api } from './api.js';

export const authService = {
  // Telegram orqali ro'yxatdan o'tish
  async registerInit(telegramId) { 
    return api.post('/auth/register-init', { telegramId }); 
  },
  async checkVerifyStatus(telegramId) { 
    return api.get(`/auth/verify-status?telegramId=${telegramId}`); 
  },
  async registerComplete(data) { 
    return api.post('/auth/register-complete', data); 
  },
  
  // Email va Parol bilan kirish (Kelajakda qo'shiladi)
  async login({ email, password }) {
    throw new Error("Email bilan kirish tez kunda ishga tushadi.");
  },
  
  // Parolni tiklash (Kelajakda qo'shiladi)
  async forgotPassword(telegramId) {
    throw new Error("Parolni tiklash tez kunda ishga tushadi.");
  },
  async resetPassword(data) {
    throw new Error("Parolni tiklash tez kunda ishga tushadi.");
  },
};