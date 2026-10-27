import { api } from './api.js';

export const adminService = {
  stats: () => api.get('/admin/stats'),
  games: {
    list: () => api.get('/admin/games'),
    create: (payload) => api.post('/admin/games', payload),
    update: (id, payload) => api.patch(`/admin/games/${encodeURIComponent(id)}`, payload),
    remove: (id) => api.delete(`/admin/games/${encodeURIComponent(id)}`),
  },
  users: () => api.get('/admin/users'),
  orders: () => api.get('/admin/orders'),
  reports: () => api.get('/admin/reports'),
  reviews: () => api.get('/admin/reviews'),
  categories: () => api.get('/admin/categories'),
  logs: () => api.get('/admin/logs'),
};