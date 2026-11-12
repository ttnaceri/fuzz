import { api } from './api.js';

export const authService = {
  async login(data) {
    return api.post('/api/auth/login', data);
  },
  async register(data) {
    return api.post('/api/auth/register', data);
  },
  async qrCreate() {
    return api.post('/api/auth/qr/create', {});
  },
  async qrStatus(token) {
    return api.get('/api/auth/qr/status', { params: { token } });
  },
  async qrApprove(token, mode = 'my_device', guestHours = 1) {
  return api.post('/api/auth/qr/approve', { token, mode, guestHours });
},
async qrVerifyCode(token, code) {
  return api.post('/api/auth/qr/verify-code', { token, code });
},
async qrReject(token) {
  return api.post('/api/auth/qr/reject', { token });
},
  async logout() {
    return api.post('/api/auth/logout', {});
  },

  // ✅ YANGI: Foydalanuvchi ma'lumotlarini olish (refreshUser uchun)
  async me() {
    return api.get('/api/auth/me');
  },

  // Telegram ID o'zgartirish
  async requestTelegramChange(userId, telegramId) {
    return api.post(`/api/users/${userId}/telegram/request`, { telegramId });
  },
  async verifyTelegramChange(userId, code) {
    return api.post(`/api/users/${userId}/telegram/verify`, { code });
  },
  async deleteAccount(userId) {
    return api.delete(`/api/users/${userId}/danger`);
  },
};