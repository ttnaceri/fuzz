import { api } from './api.js';

export const authService = {
  async login(data) {
    // data ichida { username, password } bor
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
  async qrApprove(token) {
    return api.post('/api/auth/qr/approve', { token });
  },
  async qrReject(token) {
    return api.post('/api/auth/qr/reject', { token });
  },
  async logout() {
    return api.post('/api/auth/logout', {});
  }
};