import { api } from './api.js';

export const wishlistService = {
  async list() {
    return api.get('/wishlist');
  },
  async add(gameId) {
    return api.post('/wishlist', { gameId });
  },
  async remove(id) {
    return api.delete(`/wishlist/${encodeURIComponent(id)}`);
  },
};