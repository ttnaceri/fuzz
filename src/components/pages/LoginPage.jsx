import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useAuth from '../hooks/useAuth.js';
import { validateLoginForm } from '../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Qurilma turini aniqlash
  const [isMobile, setIsMobile] = useState(false);
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    // Ekran o'lchamiga qarab mobil ekanligini aniqlaymiz
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Har 30 soniyada yangilanadigan vaqtinchalik QR token yaratamiz
    const generateToken = () => setQrToken(`fuzz-login-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    generateToken();
    const interval = setInterval(generateToken, 30000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validateLoginForm(form);
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Mobil qurilmada QR kod skanerlanganda shu sahifa ochiladi
  const handleMobileApprove = async () => {
    setLoading(true);
    try {
      // Simulyatsiya: Telefon orqali kirilganda avtomatik login qilamiz
      await login({ email: 'mobile-user@fuzz.com', password: 'demo' });
      alert("Muvaffaqiyatli tasdiqlandi! Endi kompyuteringizga o'ting.");
    } catch (err) {
      setServerError("Tasdiqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // AGAR MOBIL QURILMA BO'LSA:
  if (isMobile) {
    return (
      <div className="auth-card text-center">
        <h1>Fuzz Mobile</h1>
        <p className="text-muted mb-2">Mobil qurilmadan tizimga kirish</p>
        
        <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
          <i className="fa-solid fa-mobile-screen" style={{ fontSize: '3rem', color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Kompyuteringizdagi QR kodni skanerlang yoki pastdagi tugmani bosing.
          </p>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleMobileApprove} disabled={loading}>
          {loading ? 'Tasdiqlanmoqda...' : 'Tizimga kirishni tasdiqlash'}
        </button>
        
        <div className="auth-card__footer mt-2">
          <Link to="/">Bosh sahifaga qaytish</Link>
        </div>
      </div>
    );
  }

  // AGAR DESKTOP (KOMPYUTER) BO'LSA:
  return (
    <div className="auth-card" style={{ maxWidth: '800px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Chap tomon: Oddiy Login */}
      <div>
        <h1>Sign in</h1>
        {serverError && <div className="form-error mb-2">{serverError}</div>}
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                aria-label="Toggle password"
              >
                <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="auth-card__footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>

      {/* O'ng tomon: QR Kod */}
      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>QR orqali kirish</h2>
        <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          Fuzz Mobile ilovasi bilan skanerlang
        </p>
        
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8 }}>
          <QRCodeSVG 
            value={qrToken} 
            size={150}
            bgColor={"#ffffff"}
            fgColor={"#100b0a"}
          />
        </div>
        
        <p className="text-muted text-center" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
          <i className="fa-solid fa-rotate" /> Kod har 30 soniyada yangilanadi
        </p>
      </div>
      
    </div>
  );
}