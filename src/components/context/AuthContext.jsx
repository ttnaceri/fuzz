import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { api } from '../services/api.js';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backenddan foydalanuvchining eng yangi ma'lumotlarini olish
  const refreshUser = useCallback(async () => {
    try {
      const cached = storage.getAuth();
      if (!cached?.user?.id) return null;

      // Backenddan barcha userlarni olib, o'zimiznikini topamiz
      const res = await api.get('/api/admin/users');
      const currentUser = (res.users || []).find(u => u.id === cached.user.id);

      if (currentUser) {
        setUser(currentUser);
        storage.setAuth({ user: currentUser });
        return currentUser;
      }
      return null;
    } catch (e) {
      console.warn("Balansni yangilashda xato:", e);
      return null;
    }
  }, []);

  // Sahifa yuklanganda keshdan foydalanuvchini olish va yangilash
  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(cached.user);
      refreshUser();
    }
    setLoading(false);
  }, [refreshUser]);

  // Foydalanuvchi boshqa tabdan qaytganda yoki sahifa fokus olganda balansni yangilash
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Har 60 soniyada balansni avtomatik yangilab turish
    const interval = setInterval(() => {
      refreshUser();
    }, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user) throw new Error(res?.error || "Xatolik");
    setUser(res.user);
    storage.setAuth({ user: res.user });
    // Login bo'lgandan keyin darhol to'liq ma'lumotlarni olish
    setTimeout(() => refreshUser(), 100);
    return res.user;
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
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}