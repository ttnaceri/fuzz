import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { api } from '../services/api.js';
import { storage } from '../utils/storage.js';

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
      throw new Error('Authentication is unavailable: backend not configured.');
    }
    const res = await authService.login(credentials);
    const u = res?.user || res;
    setUser(u);
    storage.setAuth({ user: u });
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    if (!api.isConfigured()) {
      throw new Error('Registration is unavailable: backend not configured.');
    }
    const res = await authService.register(payload);
    const u = res?.user || res;
    setUser(u);
    storage.setAuth({ user: u });
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (api.isConfigured()) await authService.logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    storage.clearAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user && (user.role === 'admin' || user.isAdmin === true),
      loading,
      error,
      login,
      register,
      logout,
      setError,
    }),
    [user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}