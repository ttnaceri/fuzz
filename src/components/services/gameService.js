import { api } from './api.js';

const CACHE_KEY = 'fuzz_cached_games';

export const gameService = {
  // Keshni tozalash funksiyasi (bu yetishmayotgan edi)
  clearCache: () => {
    localStorage.removeItem(CACHE_KEY);
  },

  // Barcha o'yinlarni olish
  getGames: async (options = {}) => {
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
      console.warn("[Offline Mode] Serverga ulanib bo'lmadi, keshdan o'qilmoqda...");
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          return { games: cached.data, isOffline: true };
        } catch (e) { /* ignore */ }
      }
      throw err;
    }
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
        } catch (e) { /* ignore */ }
      }
      throw err;
    }
  },
};