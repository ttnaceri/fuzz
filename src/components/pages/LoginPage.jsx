import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { config } from '../config/config.js';
import useToast from '../hooks/useToast.js';

export default function LoginPage() {
  const [qrToken, setQrToken] = useState('fuzz_login_token_' + Math.random().toString(36).substring(7));
  const { info } = useToast();
  
  const qrUrl = `${config.telegram?.botUrl || 'https://t.me/Bot'}?start=${qrToken}`;

  // Email formasi bosilganda chiqadigan ogohlantirish
  const handleSoon = (e) => {
    e.preventDefault();
    info("Email va Parol orqali kirish tez kunda ishga tushadi!");
  };

  return (
    <div className="auth-card" style={{ maxWidth: '800px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Chap tomon: Email Login (Soon) */}
      <div>
        <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sign in <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Soon</span>
        </h1>
        
        <form onSubmit={handleSoon}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="example@mail.com" 
              // Endi disabled emas, yozish mumkin
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="********" 
              // Endi disabled emas
            />
          </div>
          
          {/* Tugma endi faol va bosilganda toast chiqaradi */}
          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
        </form>
        
        <div className="auth-card__footer">
          <button 
            onClick={handleSoon} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
          >
            Forgot password? (Soon)
          </button>
        </div>
      </div>

      {/* O'ng tomon: Telegram QR Kod */}
      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Telegram orqali kirish</h2>
        <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          Botimiz orqali skanerlang
        </p>
        
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8 }}>
          <QRCodeSVG value={qrUrl} size={150} />
        </div>
        
        <p className="text-muted text-center" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
          <i className="fa-solid fa-rotate" /> Kod har 1 daqiqada yangilanadi
        </p>

        <div className="auth-card__footer mt-3 text-center">
          Akkountingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
        </div>
      </div>
    </div>
  );
}