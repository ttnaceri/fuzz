import { api } from './api.js';
import { config } from '../config/config.js';

let cache = null;
let cachePromise = null;

/**
 * Local fallback — a hard copy of the three mandatory games, used if the
 * JSON fetch fails for any reason.
 */
const FALLBACK_GAMES = [
  {
    id: 'call-of-duty-modern-warfare-2',
    title: 'Call of Duty: Modern Warfare 2',
    description:
      'The legendary FPS campaign and multiplayer experience.',
    genre: 'FPS',
    genres: ['FPS', 'Action', 'Shooter'],
    price: 0,
    currency: 'USD',
    image: '/image/games/modern-warfare-2.jpg',
    cover: '/image/games/modern-warfare-2.jpg',
    downloadFile: 'CallOfDutyModernWarfare2.rar',
    downloadUrl: '/game/CallOfDutyModernWarfare2.rar',
    available: false,
    availability: 'unavailable',
    developer: 'Infinity Ward',
    publisher: 'Activision',
    releaseDate: '2009-11-10',
  },
  {
    id: 'let-for-dead-i',
    title: 'Let For Dead I',
    description: 'Survive the zombie apocalypse alone or with friends.',
    genre: 'Survival',
    genres: ['Survival', 'Horror', 'Co-op'],
    price: 0,
    currency: 'USD',
    image: '/image/games/let-for-dead-i.jpg',
    cover: '/image/games/let-for-dead-i.jpg',
    downloadFile: 'letForDead-I.rar',
    downloadUrl: '/game/letForDead-I.rar',
    available: false,
    availability: 'unavailable',
    developer: 'Valve',
    publisher: 'Valve',
    releaseDate: '2008-11-17',
  },
  {
    id: 'ravenfield',
    title: 'Ravenfield',
    description: 'Single-player FPS with large-scale battles.',
    genre: 'FPS',
    genres: ['FPS', 'Sandbox', 'Action'],
    price: 0,
    currency: 'USD',
    image: '/image/games/ravenfield.jpg',
    cover: '/image/games/ravenfield.jpg',
    downloadFile: 'Ravenfield.7z',
    downloadUrl: '/game/Ravenfield.7z',
    available: false,
    availability: 'unavailable',
    developer: 'SteelRaven7',
    publisher: 'SteelRaven7',
    releaseDate: '2017-05-18',
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
    const res = await fetch(config.localManifestUrl, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.games)) {
      throw new Error('Invalid manifest structure');
    }
    return data.games.map(normalizeLocalGame);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn(
      '[gameService] Local manifest unavailable, using fallback:',
      err.message
    );
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

    const localGames =
      local.status === 'fulfilled' ? local.value : FALLBACK_GAMES.map(normalizeLocalGame);
    const remoteGames = remote.status === 'fulfilled' ? remote.value : [];

    if (remote.status === 'rejected') {
      console.warn('[gameService] Remote games unavailable:', remote.reason?.message);
    }

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

  // Try remote individually
  if (api.isConfigured()) {
    try {
      const remote = await api.get(`/games/${encodeURIComponent(id)}`, { signal });
      if (remote) return normalizeLocalGame(remote);
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