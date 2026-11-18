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
  }, [refreshUser]);

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

  // Faqat joriy sessiyani tozalaydi (logout tugmasi uchun emas — signOut ishlatiladi)
  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    const currentId = user?.id;
    setUser(null);
    storage.clearAuth();
    storage.clearAuthSession();
    if (currentId) removeAccount(currentId);
  }, [user]);

  const switchAccount = useCallback((accountUser, accountToken) => {
    const normalized = normalizeUser(accountUser);
    setUser(normalized);
    storage.clearAuthSession();
    storage.setAuth({ user: normalized, token: accountToken });
    saveAccount(normalized, accountToken);
  }, []);

  /**
   * Sign Out:
   *  1) Serverdan joriy sessiyani bekor qiladi.
   *  2) Joriy akkauntni savedAccounts dan O'CHIRADI (phantom bo'lmasin).
   *  3) Agar boshqa saqlangan akkaunt bo'lsa — o'shanga o'tadi va userni qaytaradi.
   *  4) Aks holda null qaytaradi.
   * @returns {Promise<object|null>} nextUser yoki null
   */
  const signOut = useCallback(async () => {
    const currentUserId = user?.id;

    try { await authService.logout(); } catch (e) {}

    // 1) Joriy akkauntni ro'yxatdan olib tashlaymiz
    if (currentUserId) {
      removeAccount(currentUserId);
    }

    // 2) Qolgan akkauntlarni tekshiramiz (endi joriy akkaunt yo'q)
    const remaining = (getSavedAccounts() || []).filter(a => a.user?.id !== currentUserId);

    if (remaining.length > 0) {
      // Eng oxirgi ishlatilganini tanlaymiz (saveAccount lastUsed bo'yicha sortlaydi)
      const nextAccount = remaining[0];
      const normalized = normalizeUser(nextAccount.user);
      setUser(normalized);
      storage.clearAuthSession();
      storage.setAuth({ user: normalized, token: nextAccount.token });
      saveAccount(normalized, nextAccount.token); // lastUsed yangilanadi
      return normalized;
    }

    // 3) Boshqa akkaunt yo'q — to'liq chiqamiz
    setUser(null);
    storage.clearAuth();
    storage.clearAuthSession();
    return null;
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