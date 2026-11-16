// src/components/context/AuthContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { storage, saveAccount, removeAccount, getSavedAccounts } from '../utils/storage.js';

export const AuthContext = createContext(null);

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const balanceNum = rawUser.balance != null ? Number(rawUser.balance) : 0;
  return {
    ...rawUser,
    balance: isNaN(balanceNum) ? 0 : Math.round(balanceNum * 100) / 100,
  };
}

// Ikkala storage'dan auth olish
function getStoredAuth() {
  return storage.getAuth() || storage.getAuthSession();
}

// Qaysi storage'da saqlanganini aniqlash
function getAuthSource() {
  if (storage.getAuth()?.token) return 'local';
  if (storage.getAuthSession()?.token) return 'session';
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Online/Offline holatini kuzatish
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      refreshUser();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Foydalanuvchini backenddan yangilash
  const refreshUser = useCallback(async () => {
    try {
      const cached = getStoredAuth();
      // Agar token bo'lmasa, hech narsa qilmaymiz (401 xatosini oldini olish uchun)
      if (!cached?.token) return null;

      const res = await authService.me();
      if (!res?.user) return null;

      const normalized = normalizeUser(res.user);

      // Qaysi storage'da saqlangan bo'lsa, o'shanga yozish
      const source = getAuthSource();
      if (source === 'session') {
        storage.setAuthSession({ user: normalized, token: cached.token });
      } else {
        storage.setAuth({ user: normalized, token: cached.token });
        saveAccount(normalized, cached.token);
      }

      setUser(normalized);
      return normalized;
    } catch (e) {
      // 401 bo'lsa, tokenni tozalash (sessiya eskirgan)
      if (e.status === 401) {
        console.warn("Sessiya eskirgan, tizimdan chiqarildi");
        storage.clearAuth();
        storage.clearAuthSession();
        setUser(null);
      }
      return null;
    }
  }, []);

  // Sahifa yuklanganda keshdan foydalanuvchini olish
  useEffect(() => {
    const cached = getStoredAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
      refreshUser().catch(() => {});
    }
    setLoading(false);
  }, [refreshUser]);

  // Har 30 sekundda foydalanuvchini yangilash
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshUser().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  // Login
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user || !res.token) throw new Error(res?.error || 'Token olinmadi');

    const normalized = normalizeUser(res.user);
    
    // 1. State ni yangilash
    setUser(normalized);
    
    // 2. LocalStorage ga yozish
    storage.clearAuthSession();
    storage.setAuth({ user: normalized, token: res.token });
    
    // 3. Saqlangan akkauntlar ro'yxatiga qo'shish
    saveAccount(normalized, res.token);

    return normalized;
  }, []);

  // Akkauntdan chiqish
  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    setUser(null);
    storage.clearAuth();
    storage.clearAuthSession();
  }, []);

  // Boshqa saqlangan akkauntga o'tish
  const switchAccount = useCallback((accountUser, accountToken) => {
    const normalized = normalizeUser(accountUser);
    setUser(normalized);
    storage.clearAuthSession();
    storage.setAuth({ user: normalized, token: accountToken });
    saveAccount(normalized, accountToken);
  }, []);

  // Akkauntni butunlay o'chirish
  const removeSavedAccount = useCallback((userId) => {
    removeAccount(userId);
  }, []);

  // QR login natijasini o'rnatish
  const setSession = useCallback((sessionUser, sessionToken, mode = 'local') => {
    if (!sessionUser || !sessionToken) return;
    const normalized = normalizeUser(sessionUser);

    if (mode === 'session') {
      storage.clearAuth();
      storage.setAuthSession({ user: normalized, token: sessionToken });
    } else {
      storage.clearAuthSession();
      storage.setAuth({ user: normalized, token: sessionToken });
      saveAccount(normalized, sessionToken);
    }

    setUser(normalized);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user && (user.role === 'admin' || user.role === 'super_admin'),
      loading,
      isOffline,
      login,
      logout,
      switchAccount,
      removeSavedAccount,
      getSavedAccounts,
      refreshUser,
      setSession,
    }),
    [user, loading, isOffline, login, logout, switchAccount, removeSavedAccount, refreshUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}