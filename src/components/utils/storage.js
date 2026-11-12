/**
 * Safe localStorage + sessionStorage wrapper.
 */
import { STORAGE_KEYS } from './constants.js';

const isBrowser = typeof window !== 'undefined';
const hasLocal = isBrowser && !!window.localStorage;
const hasSession = isBrowser && !!window.sessionStorage;

// ==========================================
// localStorage (doimiy — brauzer yopilsa ham qoladi)
// ==========================================
export function getItem(key, fallback = null) {
  if (!hasLocal) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  if (!hasLocal) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function removeItem(key) {
  if (!hasLocal) return;
  try {
    window.localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ==========================================
// sessionStorage (vaqtinchalik — brauzer yopilganda o'chadi)
// ==========================================
export function getSessionItem(key, fallback = null) {
  if (!hasSession) return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setSessionItem(key, value) {
  if (!hasSession) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function removeSessionItem(key) {
  if (!hasSession) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ==========================================
// storage (asosiy API)
// ==========================================
export const storage = {
  // Auth — doimiy (localStorage)
  getAuth: () => getItem(STORAGE_KEYS.auth, null),
  setAuth: (v) => setItem(STORAGE_KEYS.auth, v),
  clearAuth: () => removeItem(STORAGE_KEYS.auth),

  // Auth — vaqtinchalik (sessionStorage) — Fuzz Client uchun
  getAuthSession: () => getSessionItem(STORAGE_KEYS.auth, null),
  setAuthSession: (v) => setSessionItem(STORAGE_KEYS.auth, v),
  clearAuthSession: () => removeSessionItem(STORAGE_KEYS.auth),

  // Cart
  getCart: () => getItem(STORAGE_KEYS.cart, []),
  setCart: (v) => setItem(STORAGE_KEYS.cart, v),
  clearCart: () => removeItem(STORAGE_KEYS.cart),

  // Theme
  getTheme: () => getItem(STORAGE_KEYS.theme, 'dark'),
  setTheme: (v) => setItem(STORAGE_KEYS.theme, v),

  // Preferences
  getPrefs: () => getItem(STORAGE_KEYS.preferences, {}),
  setPrefs: (v) => setItem(STORAGE_KEYS.preferences, v),
};