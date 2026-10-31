import { api } from './api.js';

export const authService = {
  async login(data) {
    // data ichida { username, password } bor
    return api.post('/api/auth/login', data);
  },
  async register(data) {
    return api.post('/api/auth/register', data);
  },
  async logout() {
    return api.post('/api/auth/logout', {});
  }
};