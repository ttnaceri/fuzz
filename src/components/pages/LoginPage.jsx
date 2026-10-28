import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { config } from '../config/config.js';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';
import { validateLoginForm } from '../utils/validators.js';

export default function LoginPage() {
  const [qrToken] = useState('fuzz_login_token_' + Math.random().toString(36).substring(7));
  const { info, success, error: toastError } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Forma holati
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const qrUrl = `${config.telegram?.botUrl || 'https://t.me/Bot'}?start=${qrToken}`;

  // Email va parol orqali kirish
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validatsiya
    const v = validateLoginForm(form);
    setErrors(v.errors);
    if (!v.valid) return;

    setLoading(true);
    try {
      await login(form);
      success('Tizimga muvaffaqiyatli kirdingiz!');
      // Agar oldingi sahifa bo'lsa o'shanga, aks holda account ga
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      toastError(err.message || 'Email yoki parol xato!');
    } finally {
      setLoading(false);
    }
  };

  // Parolni tiklash (Hozircha faqat toast)
  const handleForgotPassword = () => {
    if (!form.email) {
      info("Iltimos, avval email manzilingizni kiriting.");
      return;
    }
    info(`Parolni tiklash havolasi ${form.email} manziliga yuborildi (Tez kunda ishlaydi).`);
  };

  return (
    <div className="auth-card" style={{ maxWidth: '800px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Chap tomon: Email Login */}
      <div>
        <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sign in
        </h1>
        
        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="example@mail.com" 
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="********" 
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Kirish...' : 'Sign in'}
          </button>
        </form>
        
        <div className="auth-card__footer">
          <button 
            onClick={handleForgotPassword} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
          >
            Forgot password?
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