import { api } from './api.js';

export const authService = {
  async registerInit(telegramId) { return api.post('/auth/register-init', { telegramId }); },
  async checkVerifyStatus(telegramId) { return api.get(`/auth/verify-status?telegramId=${telegramId}`); },
  async registerComplete(data) { return api.post('/auth/register-complete', data); },
  async forgotPassword(telegramId) { return api.post('/auth/forgot-password', { telegramId }); },
  async resetPassword(data) { return api.post('/auth/reset-password', data); },
};