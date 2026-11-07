import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function ResetPasswordCodePage() {
  const [code, setCode] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 5) return toastError('5 xonali kodni kiriting');
    const username = sessionStorage.getItem('reset_username');
    if (!username) return navigate('/reset-password');
    try {
      const res = await api.post('/api/auth/reset/verify', { username, code });
      success('Kod tasdiqlandi!');
      sessionStorage.setItem('reset_token', res.resetToken);
      navigate('/reset-password/new');
    } catch (err) {
      toastError(err?.message || 'Kod xato');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Tasdiqlash Kodi</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Telegramingizga yuborilgan 5 xonali kodni kiriting.
        </p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="00000"
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '10px', fontSize: '1.2rem', marginBottom: '1.5rem' }} />
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Tasdiqlash
          </button>
        </form>
      </div>
    </div>
  );
}