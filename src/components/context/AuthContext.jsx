import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { api } from '../services/api.js';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

// Backenddan kelgan userni normalize qilish funksiyasi
// bu float xatolarini oldini oladi va balansni to'g'ri saqlaydi
function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const balanceNum = rawUser.balance != null ? Number(rawUser.balance) : 0;
  return {
    ...rawUser,
    // Balansni aniq raqamga aylantiramiz. toFixed(2) bilan emas,
    // chunki toFixed string qaytaradi va keyingi hisob-kitoblarni buzadi
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

      // Tokensiz sessiyani shu yerda o'chirmaymiz: yangi backend unga 401 qaytaradi (pastda tozalanadi),
      // eski backendda esa /auth/me yo'q (404) — u holda sessiya saqlanib qoladi.
      const res = await api.get('/api/auth/me');
      const currentUser = res?.user;

      if (currentUser) {
        const normalized = normalizeUser(currentUser);
        setUser(normalized);
        storage.setAuth({ ...storage.getAuth(), user: normalized });
        return normalized;
      }
      return null;
    } catch (e) {
      // Token eskirgan / akkaunt bloklangan — sessiyani tozalaymiz
      if (e?.status === 401) {
        setUser(null);
        storage.clearAuth();
      } else {
        console.warn("Balansni yangilashda xato:", e);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const cached = storage.getAuth();
    if (cached?.user) {
      setUser(normalizeUser(cached.user));
      refreshUser();
    }
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      refreshUser();
    }, 30000); // har 30 soniyada yangilash

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    if (!res || !res.user) throw new Error(res?.error || "Xatolik");
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    storage.setAuth({ user: normalized, token: res.token || null });
    setTimeout(() => refreshUser(), 100);
    return normalized;
  }, [refreshUser]);

  // QR orqali kirish: backend tasdiqlangan sessiya uchun user + token qaytaradi
  const loginWithSession = useCallback((rawUser, token) => {
    const normalized = normalizeUser(rawUser);
    setUser(normalized);
    storage.setAuth({ user: normalized, token: token || null });
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
      isAdmin: !!user && (user.role === 'admin' || user.role === 'super_admin'),
      loading,
      login,
      loginWithSession,
      logout,
      refreshUser,
    }),
    [user, loading, login, loginWithSession, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}