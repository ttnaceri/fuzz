import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';

export default function RegisterTelegramPage() {
  const [tgId, setTgId] = useState('');
  const { success, info } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tgId.trim()) return info("Telegram ID raqamingizni kiriting!");
    if (tgId.length < 9) return info("Telegram ID kamida 9 xonali bo'lishi kerak!");

    sessionStorage.setItem('reg_tg_id', tgId.trim());
    success("Telegram ID saqlandi! Endi botdan tasdiqlang.");
    navigate('/register/form');
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setTgId(val);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Telegram orqali ro'yxatdan o'tish</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Telegram ID raqamingizni kiriting (9 xonali).
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Telegram ID" 
              value={tgId} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '5px' }} 
            />
            <div style={{ textAlign: 'right', color: '#b9a6a2', fontSize: '0.75rem', marginTop: '0.3rem' }}>{tgId.length}/9</div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>ID ni yuborish</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  );
}