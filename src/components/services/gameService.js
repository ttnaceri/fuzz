import { api } from './api.js';

const CACHE_KEY = 'fuzz_cached_games';
const CACHE_TIME = 5 * 60 * 1000; // 5 daqiqa kesh

export const gameService = {
  // Barcha o'yinlarni olish (Offline rejim bilan)
  getGames: async (options = {}) => {
    try {
      // 1. Internet bor - serverdan olamiz
      const res = await api.get('/games', options);
      
      // Keshga saqlaymiz
      if (res && res.games) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: res.games,
          timestamp: Date.now()
        }));
      }
      return res;
    } catch (err) {
      // 2. Internet yo'q - keshdan olamiz
      console.warn("[Offline Mode] Serverga ulanib bo'lmadi, keshdan o'qilmoqda...");
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          return { games: cached.data, isOffline: true };
        } catch (e) {
          throw err;
        }
      }
      throw err; // Kesh ham bo'lmasa, xato qaytaramiz
    }
  },

  // Bitta o'yinni olish (Offline rejim bilan)
  getGameById: async (id, options = {}) => {
    try {
      const res = await api.get(`/games/${id}`, options);
      return res.game;
    } catch (err) {
      // Internet yo'q bo'lsa keshdan qidiramiz
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

  // Kategoriyalar
  getCategories: async () => {
    try {
      return await api.get('/categories');
    } catch (err) {
      const cached = localStorage.getItem('fuzz_cached_categories');
      if (cached) return { categories: JSON.parse(cached) };
      throw err;
    }
  },

  // Boshqa funksiyalar (Library, Wishlist va h.k.)
  getUserLibrary: async (userId) => {
    try {
      return await api.get(`/users/${userId}/library`);
    } catch (err) {
      const cached = localStorage.getItem('fuzz_cached_library');
      if (cached) return { games: JSON.parse(cached) };
      throw err;
    }
  },
};