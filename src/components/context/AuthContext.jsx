import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { storage } from '../utils/storage.js';
import { api } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Foydalanuvchi ma'lumotlarini yangilash
  const refreshUser = useCallback(async () => {
    try {
      const cached = storage.getAuth();
      if (!cached?.user?.id) return;

      const res = await api.get('/api/admin/users');
      const currentUser = res.users?.find(u => u.id === cached.user.id);
      
      if (currentUser) {
        setUser(currentUser);
        storage.setAuth({ user: currentUser });
      }
    } catch (e) {
      console.warn("Balansni yangilashda xato:", e);
    }
  }, []);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(cached.user);
      refreshUser();
    }
    setLoading(false);
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user) throw new Error(res?.error || "Xatolik");
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
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}