import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) setUser(cached.user);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    
    if (!res || !res.user) {
      throw new Error(res?.error || "Tizimga kirishda xatolik yuz berdi");
    }

    setUser(res.user);
    storage.setAuth({ user: res.user });
    return res.user;
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
      isAdmin: !!user && (user.role === 'admin'),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}