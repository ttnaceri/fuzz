import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { api } from '../services/api.js';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const balanceNum = rawUser.balance != null ? Number(rawUser.balance) : 0;
  return {
    ...rawUser,
    balance: isNaN(balanceNum) ? 0 : Math.round(balanceNum * 100) / 100,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const cached = storage.getAuth();
      if (!cached?.user?.id) return null;

      const res = await api.get('/api/admin/users');
      const currentUser = (res.users || []).find(u => u.id === cached.user.id);

      if (currentUser) {
        const normalized = normalizeUser(currentUser);
        setUser(normalized);
        storage.setAuth({ user: normalized });
        return normalized;
      }
      return null;
    } catch (e) {
      console.warn("Balansni yangilashda xato:", e.message);
      return null;
    }
  }, []);

  // QR login natijasini o'rnatish (desktop tomonda /auth/qr/status "approved" bergach)
  const setSession = useCallback((sessionUser, sessionToken) => {
    if (!sessionUser || !sessionToken) return;
    const normalized = normalizeUser(sessionUser);
    setUser(normalized);
    storage.setAuth({ user: normalized, token: sessionToken });
    // Balansni fonda yangilash
    setTimeout(() => { refreshUser().catch(() => {}); }, 100);
  }, [refreshUser]);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
      refreshUser();
    }
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 60000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user) throw new Error(res?.error || "Xatolik");

    const normalized = normalizeUser(res.user);
    setUser(normalized);
    storage.setAuth({ user: normalized, token: res.token });
    setTimeout(() => refreshUser(), 100);
    return normalized;
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    setUser(null);
    storage.clearAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user && (user.role === 'admin'),
      loading,
      login,
      logout,
      refreshUser,
      setSession,
    }),
    [user, loading, login, logout, refreshUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}