import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { config } from '../config/config.js';

export default function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const generateToken = () => setQrToken(`login_${Math.random().toString(36).substring(2, 10)}`);
    generateToken();
    const interval = setInterval(generateToken, 60000);
    return () => { window.removeEventListener('resize', checkMobile); clearInterval(interval); };
  }, []);

  const qrUrl = `${config.telegram?.botUrl || 'https://t.me/Bot'}?start=${qrToken}`;

  return (
    <div className="auth-card" style={{ maxWidth: '800px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
      
      {/* Chap tomon: Email Login (Soon) */}
      <div style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <h1 style={{ display: 'flex', justifyContent: 'space-between' }}>
          Sign in <span className="badge badge-warning">Soon</span>
        </h1>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="example@mail.com" disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="********" disabled />
        </div>
        <button className="btn btn-primary btn-block" disabled>Sign in</button>
        <div className="auth-card__footer">
          <Link to="/forgot-password" onClick={(e) => e.preventDefault()}>Forgot password? (Soon)</Link>
        </div>
      </div>

      {/* O'ng tomon: Telegram QR Kod */}
      <div style={{ borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', paddingLeft: isMobile ? '0' : '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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