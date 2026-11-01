import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Loading from './Loading.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. Sessiya tekshirilayotganda yuklanish indikatorini ko'rsatish
  if (loading) {
    return <Loading label="Sessiya tekshirilmoqda..." />;
  }

  // 2. Agar foydalanuvchi tizimga kirmagan bo'lsa, Login sahifasiga yo'naltirish
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 3. Agar sahifa faqat adminlar uchun bo'lsa va foydalanuvchi admin bo'lmasa
  if (adminOnly && !isAdmin) {
    return (
      <div className="state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: '#ed5555' }} />
        <h3 style={{ margin: '1rem 0 0.5rem 0' }}>403 — Ruxsat berilmagan</h3>
        <p className="text-muted">Bu sahifaga faqat administratorlar kira oladi.</p>
      </div>
    );
  }

  // 4. Barcha tekshiruvlar muvaffaqiyatli o'tdi, sahifani ko'rsatish
  return children;
}