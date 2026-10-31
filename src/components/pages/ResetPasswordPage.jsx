import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';

export default function ResetPasswordPage() {
  const [tgId, setTgId] = useState('');
  const { success, info } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tgId) return info("Telegram ID ni kiriting!");
    sessionStorage.setItem('reset_tg_id', tgId);
    success("Kod yuborildi! Telegram botni tekshiring.");
    navigate('/reset-password/code');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#8a1200', textAlign: 'center', marginBottom: '1.5rem' }}>Reset Password</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>Enter your Telegram ID to receive a code.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Telegram ID" value={tgId} onChange={e => setTgId(e.target.value)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', marginBottom: '1rem', boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Send Code</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}