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

function getStoredAuth() {
  return storage.getAuth() || storage.getAuthSession();
}

function getAuthSource() {
  if (storage.getAuth()?.token) return 'local';
  if (storage.getAuthSession()?.token) return 'session';
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const refreshUser = useCallback(async () => {
    try {
      const cached = getStoredAuth();
      if (!cached?.user?.id) return null;
      const res = await authService.me();
      if (!res?.user) return null;
      const normalized = normalizeUser(res.user);
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
      return null;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); refreshUser(); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  useEffect(() => {
    const cached = getStoredAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
      refreshUser().catch(() => {});
    }
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => { refreshUser().catch(() => {}); }, 30000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user || !res.token) throw new Error(res?.error || 'Token olinmadi');
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    storage.clearAuthSession();
    storage.setAuth({ user: normalized, token: res.token });
    saveAccount(normalized, res.token);
    return normalized;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    setUser(null);
    storage.clearAuth();
    storage.clearAuthSession();
  }, []);

  const switchAccount = useCallback((accountUser, accountToken) => {
    const normalized = normalizeUser(accountUser);
    setUser(normalized);
    storage.clearAuthSession();
    storage.setAuth({ user: normalized, token: accountToken });
    saveAccount(normalized, accountToken);
  }, []);

  // YANGI: Sign Out — agar 2-akkaunt bo'lsa, o'shanga o'tadi
  const signOut = useCallback(async () => {
    const currentUserId = user?.id;
    const allAccounts = getSavedAccounts() || [];
    
    // Joriy akkauntdan boshqa akkauntlarni topish
    const otherAccounts = allAccounts.filter(a => a.user.id !== currentUserId);

    try { await authService.logout(); } catch (e) {}

    if (otherAccounts.length > 0) {
      // Boshqa akkaunt bor — o'shanga o'tamiz (eng oxirgi ishlatilgan)
      const nextAccount = otherAccounts[0];
      const normalized = normalizeUser(nextAccount.user);
      setUser(normalized);
      storage.clearAuthSession();
      storage.setAuth({ user: normalized, token: nextAccount.token });
      saveAccount(normalized, nextAccount.token);
    } else {
      // Boshqa akkaunt yo'q — shunchaki chiqamiz
      setUser(null);
      storage.clearAuth();
      storage.clearAuthSession();
    }
  }, [user]);

  const removeSavedAccount = useCallback((userId) => {
    removeAccount(userId);
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
      signOut,
      switchAccount,
      removeSavedAccount,
      getSavedAccounts,
      refreshUser,
      setSession,
    }),
    [user, loading, isOffline, login, logout, signOut, switchAccount, removeSavedAccount, refreshUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}