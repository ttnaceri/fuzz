import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function RegisterFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  
  const [tgId, setTgId] = useState('');
  const [form, setForm] = useState({ email: '', confirmEmail: '', username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. URL dan tgId ni tekshirish (Telegram WebApp dan kelgan bo'lsa)
    const urlTgId = searchParams.get('tgId');
    
    // 2. Sessiyadan tekshirish
    const sessionTgId = sessionStorage.getItem('reg_tg_id');

    if (urlTgId) {
      setTgId(urlTgId);
      sessionStorage.setItem('reg_tg_id', urlTgId);
    } else if (sessionTgId) {
      setTgId(sessionTgId);
    } else {
      toastError("Iltimos, avval Telegram ID ingizni kiriting!");
      navigate('/register');
    }
  }, [searchParams, navigate, toastError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tgId) return;

    if (form.email !== form.confirmEmail) return toastError("Emaillar mos kelmadi!");
    if (form.password !== form.confirmPassword) return toastError("Parollar mos kelmadi!");
    if (form.password.length < 6) return toastError("Parol kamida 6 belgidan iborat bo'lishi kerak!");

    setLoading(true);
    try {
      // Backendga yuboriladigan ma'lumotlar
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        telegramId: tgId
      };

      console.log("Yuborilayotgan ma'lumot:", payload);

      await api.post('/api/auth/register', payload);
      
      success("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.");
      sessionStorage.removeItem('reg_tg_id');
      
      // Login sahifasiga o'tish
      navigate('/login');
      
    } catch (err) {
      toastError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', border: '1px solid #48201a', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Akkauntni yakunlash</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ backgroundColor: 'rgba(67, 181, 129, 0.2)', color: '#43b581', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <i className="fa-solid fa-check-circle"></i> Telegram ID ulandi: {tgId}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Confirm Email"
              value={form.confirmEmail}
              onChange={(e) => setForm({ ...form, confirmEmail: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem', fontSize: '1rem' }}>
            {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>
      </div>
    </div>
  );
}