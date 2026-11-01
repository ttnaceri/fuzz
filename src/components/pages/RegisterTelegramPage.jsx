import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';

export default function RegisterTelegramPage() {
  const [tgId, setTgId] = useState('');
  const { success, info } = useToast();
  const navigate = useNavigate();

  // Sahifa ochilganda eski sessionni tozalash (majburiy)
  useEffect(() => {
    sessionStorage.removeItem('reg_tg_id');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tgId.trim()) {
      return info("Iltimos, Telegram ID raqamingizni kiriting!");
    }

    // ID ni sessiyada saqlash
    sessionStorage.setItem('reg_tg_id', tgId.trim());
    
    success("Telegram ID saqlandi! Endi botdan tasdiqlang.");
    navigate('/register/form');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid #48201a', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>Telegram orqali ro'yxatdan o'tish</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.5' }}>
          Iltimos, Telegram ID raqamingizni kiriting. Bot sizga maxsus havola (WebApp) yuboradi.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Telegram ID (masalan: 6465879965)" 
              value={tgId} 
              onChange={e => setTgId(e.target.value)} 
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem' }} 
            />
          </div>
          <button 
            type="submit" 
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ID ni yuborish
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  );
}