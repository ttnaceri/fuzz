import { api } from './api.js';

export const authService = {
  async login({ email, password }) {
    return api.post('/auth/login', { email, password });
  },
  async register({ username, email, password }) {
    return api.post('/auth/register', { username, email, password });
  },
  async logout() {
    return api.post('/auth/logout', {});
  },
  async me() {
    return api.get('/users/me');
  },
};