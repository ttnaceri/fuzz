import { api } from './api.js';
import { config } from '../config/config.js';

let cache = null;
let cachePromise = null;

/**
 * Zaxira o'yin: Faqat backend ishlamay qolganda ko'rinadi.
 */
// Zaxira o'yinlar butunlay o'chirildi (Backenddan olinadi)
const FALLBACK_GAMES = [];

function normalizeGame(g) {
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
    const res = await fetch(`${config.localManifestUrl}?t=${Date.now()}`, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.games)) throw new Error('Invalid manifest structure');
    return data.games.map(normalizeGame);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[gameService] Local manifest unavailable:', err.message);
    return [];
  }
}

function mergeUnique(local, remote) {
  const map = new Map();
  // 1. Lokal o'yinlarni qo'shamiz (agar bo'lsa)
  for (const g of local) map.set(g.id, g);
  
  // 2. Backenddan kelgan o'yinlarni qo'shamiz. 
  // Agar ID to'g'ri kelsa, backenddagi ma'lumot (narx) ustunlik qiladi.
  for (const g of remote || []) {
    if (g && g.id) {
      map.set(g.id, normalizeGame(g));
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
      // Backend so'rovi
      api.isConfigured()
        ? api.get('/games', { signal }).then((r) => r?.games || r || [])
        : Promise.reject(new Error('Backend not configured')),
    ]);

    const localGames = local.status === 'fulfilled' ? local.value : [];
    let remoteGames = [];
    
    if (remote.status === 'fulfilled') {
      remoteGames = remote.value;
    } else {
      console.warn('[gameService] Backend unavailable, using fallback:', remote.reason?.message);
      // Backend ishlamasa, zaxira o'yinni beramiz
      remoteGames = FALLBACK_GAMES.map(normalizeGame);
    }

    // Agar backenddan umuman o'yin kelmasa va lokal ham bo'sh bo'lsa, zaxirani ko'rsatamiz
    if (remoteGames.length === 0 && localGames.length === 0) {
      remoteGames = FALLBACK_GAMES.map(normalizeGame);
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

  if (api.isConfigured()) {
    try {
      const remote = await api.get(`/games/${encodeURIComponent(id)}`, { signal });
      if (remote) return normalizeGame(remote);
    } catch { /* ignore */ }
  }
  
  // Agar hech qayerdan topilmasa, zaxiradan qidiramiz
  const fallback = FALLBACK_GAMES.find((g) => String(g.id) === String(id));
  return fallback ? normalizeGame(fallback) : null;
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