import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function QrAuthPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { setAuthUser } = useAuth(); // AuthContext ga qo'shamiz
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (!token) {
      toastError('QR token topilmadi');
      return;
    }
    // Backendda sessiyani yaratamiz (desktop)
    api.post('/api/auth/qr/generate', { token }).catch(() => {});

    // Har 2 soniyada tekshiramiz
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/auth/qr/check/${token}`);
        if (res.status === 'scanned' && res.user) {
          setStatus('scanned');
          setAuthUser(res.user);
          success('QR orqali muvaffaqiyatli kirdingiz!');
          clearInterval(interval);
          setTimeout(() => navigate('/account'), 800);
        }
      } catch { /* ignore */ }
    }, 2000);

    return () => clearInterval(interval);
  }, [token, navigate, setAuthUser, success, toastError]);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', color: '#f5eeee', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <h2>QR tasdiqlanmoqda...</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
          Mobil ilovada QR kodni skanerlang. Tasdiqlangach avtomatik kiradi.
        </p>
        <p style={{ color: '#8a1200', fontSize: '0.8rem', marginTop: '1rem' }}>
          Holat: {status}
        </p>
      </div>
    </div>
  );
}