import { api } from './api.js';

let cache = null;
let cachePromise = null;

// Backenddan o'yinlarni olish
async function fetchRemoteGames(signal) {
  try {
    // api.get avtomatik ravishda config.apiBaseUrl ni qo'shadi
    const data = await api.get('/api/games', { signal });
    const games = data.games || data || [];
    
    // Ma'lumotlarni to'g'rilash (fallback)
    return games.map(g => ({
      ...g,
      cover: g.cover || g.image,
      genres: g.genres || (g.genre ? g.genre.split(',').map(s => s.trim()) : []),
      currency: g.currency || 'USD',
      availability: g.availability || (g.available ? 'available' : 'unavailable'),
    }));
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[gameService] O\'yinlarni yuklashda xato:', err.message);
    return []; // Xato bo'lsa bo'sh massiv qaytaramiz
  }
}

export async function getAllGames({ signal } = {}) {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const games = await fetchRemoteGames(signal);
    cache = games;
    cachePromise = null;
    return games;
  })();

  return cachePromise;
}

export async function getGameById(id, { signal } = {}) {
  const all = await getAllGames({ signal });
  const found = all.find((g) => String(g.id) === String(id));
  if (found) return found;

  // Agar ro'yxatda bo'lmasa, to'g'ridan-to'g'ri backenddan so'raymiz
  if (api.isConfigured()) {
    try {
      const remote = await api.get(`/api/games/${encodeURIComponent(id)}`, { signal });
      if (remote && remote.game) {
         const g = remote.game;
         return {
            ...g,
            cover: g.cover || g.image,
            genres: g.genres || (g.genre ? g.genre.split(',').map(s => s.trim()) : []),
         };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function clearCache() {
  cache = null;
  cachePromise = null;
}

export const gameService = {
  getAllGames,
  getGameById,
  clearCache,
};