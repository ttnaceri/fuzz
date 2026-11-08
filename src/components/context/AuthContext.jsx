// src/components/context/AuthContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
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
      const res = await authService.me?.();
      if (!res?.user) return null;
      const normalized = normalizeUser(res.user);
      setUser(normalized);
      storage.setAuth({ user: normalized, token: cached.token });
      return normalized;
    } catch (e) {
      return null;
    }
  }, []);

  // QR login natijasini o'rnatish
  const setSession = useCallback((sessionUser, sessionToken) => {
    if (!sessionUser || !sessionToken) return;
    const normalized = normalizeUser(sessionUser);
    setUser(normalized);
    storage.setAuth({ user: normalized, token: sessionToken });
  }, []);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user || !res.token) throw new Error(res?.error || 'Token olinmadi');

    const normalized = normalizeUser(res.user);
    setUser(normalized);

    // ✅ ASOSIY TUZATISH: tokenni saqlash
    storage.setAuth({ user: normalized, token: res.token });

    return normalized;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (e) {}
    setUser(null);
    storage.clearAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user && (user.role === 'admin' || user.role === 'super_admin'),
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

// AuthProvider ichida:
useEffect(() => {
  const cached = storage.getAuth();
  if (cached?.user) {
    setUser(normalizeUser(cached.user));
  }
  setLoading(false);
}, []);