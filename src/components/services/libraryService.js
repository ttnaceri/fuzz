import { api } from './api.js';

export const libraryService = {
  async list() {
    return api.get('/library');
  },
  async purchases() {
    return api.get('/orders');
  },
};