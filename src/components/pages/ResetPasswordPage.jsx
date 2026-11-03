import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const username = sessionStorage.getItem('reset_username');
  const code = sessionStorage.getItem('reset_code');

  useEffect(() => {
    if (!username || !code) {
      navigate('/reset-password');
    }
  }, [username, code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toastError("Parollar mos kelmadi!");
    if (password.length < 6) return toastError("Parol kamida 6 belgidan iborat bo'lishi kerak!");

    try {
      await api.post('/api/auth/reset-password', { username, code, newPassword: password });
      success("Parol muvaffaqiyatli o'zgartirildi!");
      sessionStorage.removeItem('reset_username');
      sessionStorage.removeItem('reset_code');
      navigate('/login');
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Yangi Parol</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Yangi parolingizni o'ylab toping va kiriting.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input type="password" placeholder="Yangi Parol" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <input type="password" placeholder="Parolni tasdiqlang" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Parolni Yangilash
          </button>
        </form>
      </div>
    </div>
  );
}