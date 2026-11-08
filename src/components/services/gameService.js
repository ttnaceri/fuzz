import { api } from './api.js';

const CACHE_KEY = 'fuzz_cached_games';

export const gameService = {
  // Keshni tozalash
  clearCache: () => {
    localStorage.removeItem(CACHE_KEY);
  },

  // Bosh sahifa va boshqa joylar uchun (getAllGames)
  getAllGames: async (options = {}) => {
    try {
      const res = await api.get('/games', options);
      
      if (res && res.games) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: res.games,
          timestamp: Date.now()
        }));
      }
      return res;
    } catch (err) {
      // Offline mode
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

  // Do'kon sahifasi uchun (getGames)
  getGames: async (options = {}) => {
    return gameService.getAllGames(options);
  },

  // Bitta o'yinni olish
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