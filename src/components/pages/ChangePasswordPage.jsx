import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const resetToken = sessionStorage.getItem('reset_token');

  useEffect(() => {
    if (!resetToken) navigate('/reset-password');
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toastError('Parollar mos kelmadi');
    if (password.length < 6) return toastError('Parol kamida 6 belgi');
    try {
      await api.post('/api/auth/reset/complete', { resetToken, newPassword: password });
      success('Parol yangilandi!');
      sessionStorage.removeItem('reset_username');
      sessionStorage.removeItem('reset_token');
      navigate('/login');
    } catch (err) {
      toastError(err?.message || 'Xato');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Yangi Parol</h2>
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