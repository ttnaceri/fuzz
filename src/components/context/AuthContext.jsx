import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { api } from '../services/api.js';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

// Balansni yaxlitlash funksiyasi (float xatolarini oldini oladi)
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

  // Foydalanuvchi ma'lumotlarini yangilash (backendda /auth/me yo'qligi sababli, keshdan foydalanamiz)
  const refreshUser = useCallback(async () => {
    try {
      const cached = storage.getAuth();
      if (!cached?.user?.id) return null;

      // Backendda /auth/me yo'q, shuning uchun admin API orqali barcha userlarni olib, o'zimiznikini topamiz
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
      // Agar backend xato bersa, hech bo'lmaganda keshdagi ma'lumot qoladi
      console.warn("Balansni yangilashda xato:", e.message);
      return null;
    }
  }, []);

  // Sahifa yuklanganda keshdan foydalanuvchini olish
  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
      refreshUser(); // Balansni fonda yangilash
    }
    setLoading(false);
  }, [refreshUser]);

  // Har 60 soniyada balansni yangilab turish (faqat foydalanuvchi kirgan bo'lsa)
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
    storage.setAuth({ user: normalized });
    
    // Login bo'lgandan keyin darhol balansni yangilash
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
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}