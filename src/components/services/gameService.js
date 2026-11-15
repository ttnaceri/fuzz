import { api } from './api.js';

// Kesh faqat filtrsiz so'rovlar uchun ishlatiladi
let cache = null;
let cachePromise = null;

async function fetchRemoteGames(params = {}, signal) {
  try {
    // API so'roviga parametrlarni qo'shamiz
    const data = await api.get('/api/games', { params, signal });
    const games = data.games || data || [];
    
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
    return [];
  }
}

export async function getAllGames({ signal, filter, genre, companyId } = {}) {
  const hasFilter = filter || genre || companyId;

  // Agar filtr bo'lsa, keshni ishlatmaymiz (har doim yangi so'rov)
  if (hasFilter) {
    const params = {};
    if (filter) params.filter = filter;
    if (genre) params.genre = genre;
    if (companyId) params.companyId = companyId;
    return fetchRemoteGames(params, signal);
  }

  // Filtrsiz bo'lsa, keshdan foydalanamiz
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const games = await fetchRemoteGames({}, signal);
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