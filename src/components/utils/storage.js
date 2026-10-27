/**
 * Safe localStorage wrapper — never used as proof of authentication.
 */
import { STORAGE_KEYS } from './constants.js';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

export function getItem(key, fallback = null) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function removeItem(key) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  getAuth: () => getItem(STORAGE_KEYS.auth, null),
  setAuth: (v) => setItem(STORAGE_KEYS.auth, v),
  clearAuth: () => removeItem(STORAGE_KEYS.auth),

  getCart: () => getItem(STORAGE_KEYS.cart, []),
  setCart: (v) => setItem(STORAGE_KEYS.cart, v),
  clearCart: () => removeItem(STORAGE_KEYS.cart),

  getTheme: () => getItem(STORAGE_KEYS.theme, 'dark'),
  setTheme: (v) => setItem(STORAGE_KEYS.theme, v),

  getPrefs: () => getItem(STORAGE_KEYS.preferences, {}),
  setPrefs: (v) => setItem(STORAGE_KEYS.preferences, v),
};