import { api } from './api.js';
import { config } from '../config/config.js';

let cache = null;
let cachePromise = null;

/**
 * Zaxira o'yin (Faqat Let For Dead I)
 */
const FALLBACK_GAMES = [
  {
    id: 'let-for-dead-i',
    title: 'Let For Dead I',
    description: 'Brauzerda ishlaydigan HTML5 o\'yini. Zombi apokalipsisidan omon qoling!',
    genre: 'Survival',
    genres: ['Survival', 'Horror', 'HTML5', 'Co-op'],
    price: 0,
    currency: 'USD',
    image: '/image/games/let-for-dead-i.jpg',
    cover: '/image/games/let-for-dead-i.jpg',
    downloadUrl: 'https://ttnaceri.github.io/letForDead-I/splash.html',
    available: true,
    availability: 'available',
    isHtmlGame: true,
    developer: 'Update Inc.',
    publisher: 'Update Inc.',
    releaseDate: '2026-01-01',
  },
];

function normalizeLocalGame(g) {
  return {
    ...g,
    cover: g.cover || g.image,
    genres: g.genres || (g.genre ? [g.genre] : []),
    currency: g.currency || 'USD',
    availability: g.availability || (g.available ? 'available' : 'unavailable'),
  };
}

async function fetchLocalManifest(signal) {
  try {
    // Keshni chetlab o'tish uchun vaqt qo'shamiz (?t=...)
    const res = await fetch(`${config.localManifestUrl}?t=${Date.now()}`, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.games)) {
      throw new Error('Invalid manifest structure');
    }
    return data.games.map(normalizeLocalGame);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[gameService] Local manifest unavailable, using fallback:', err.message);
    return FALLBACK_GAMES.map(normalizeLocalGame);
  }
}

function mergeUnique(local, remote) {
  const map = new Map();
  for (const g of local) map.set(g.id, g);
  for (const g of remote || []) {
    if (g && g.id && !map.has(g.id)) {
      map.set(g.id, normalizeLocalGame(g));
    }
  }
  return Array.from(map.values());
}

export async function getAllGames({ signal } = {}) {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const [local, remote] = await Promise.allSettled([
      fetchLocalManifest(signal),
      api.isConfigured()
        ? api.get('/games', { signal }).then((r) => r?.games || r || [])
        : Promise.resolve([]),
    ]);

    const localGames = local.status === 'fulfilled' ? local.value : FALLBACK_GAMES.map(normalizeLocalGame);
    const remoteGames = remote.status === 'fulfilled' ? remote.value : [];

    const merged = mergeUnique(localGames, remoteGames);
    cache = merged;
    cachePromise = null;
    return merged;
  })();

  return cachePromise;
}

export async function getGameById(id, { signal } = {}) {
  const all = await getAllGames({ signal });
  const found = all.find((g) => String(g.id) === String(id));
  if (found) return found;

  if (api.isConfigured()) {
    try {
      const remote = await api.get(`/games/${encodeURIComponent(id)}`, { signal });
      if (remote) return normalizeLocalGame(remote);
    } catch { /* ignore */ }
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