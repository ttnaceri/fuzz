import { api } from './api.js';

export const cartService = {
  async get() {
    return api.get('/cart');
  },
  async addItem(gameId, qty = 1) {
    return api.post('/cart/items', { gameId, qty });
  },
  async removeItem(id) {
    return api.delete(`/cart/items/${encodeURIComponent(id)}`);
  },
  async checkout() {
    return api.post('/orders', {});
  },
  async orders() {
    return api.get('/orders');
  },
};