import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { storage } from '../utils/storage.js';
import { api } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) setUser(cached.user);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    if (!api.isConfigured()) {
      throw new Error('Backend sozlanmagan.');
    }
    try {
      const res = await authService.login(credentials);
      if (!res || !res.user) {
        throw new Error(res?.error || "Tizimga kirishda xatolik");
      }
      setUser(res.user);
      storage.setAuth({ user: res.user });
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    if (!api.isConfigured()) {
      throw new Error('Registration is unavailable.');
    }
    try {
      const res = await authService.register(payload);
      const u = res?.user || res;
      if (!u) throw new Error(res?.error || "Ro'yxatdan o'tishda xatolik");
      setUser(u);
      storage.setAuth({ user: u });
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (api.isConfigured()) await authService.logout();
    } catch { /* ignore */ }
    setUser(null);
    storage.clearAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user && (user.role === 'admin' || user.role === 'superAdmin' || user.isAdmin === true),
      loading,
      error,
      login,
      register,
      logout,
    }),
    [user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}