import { api } from './api.js';

const CACHE_KEY = 'fuzz_cached_games';

export const gameService = {
  clearCache: () => {
    localStorage.removeItem(CACHE_KEY);
  },

  // Asosiy funksiya
  getAllGames: async (options = {}) => {
    try {
      const res = await api.get('/games', options);
      if (res && res.games) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: res.games, timestamp: Date.now() }));
      }
      return res;
    } catch (err) {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          return { games: cached.data, isOffline: true };
        } catch (e) {}
      }
      throw err;
    }
  },

  // Alias'lar (qaysi nom bilan chaqirilsa ham ishlashi uchun)
  getGames: async (options = {}) => {
    const res = await gameService.getAllGames(options);
    return res.games ? res : { games: res }; // Array qaytsa ham o'rab beradi
  },

  fetchGames: async (options = {}) => {
    const res = await gameService.getAllGames(options);
    return res.games ? res : { games: res };
  },

  getGameById: async (id, options = {}) => {
    try {
      const res = await api.get(`/games/${id}`, options);
      return res.game;
    } catch (err) {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          const found = cached.data.find(g => g.id === id);
          if (found) return { ...found, isOffline: true };
        } catch (e) {}
      }
      throw err;
    }
  },
};