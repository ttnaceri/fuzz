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

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const qrUrl = `${config.telegram?.botUrl || 'https://t.me/Bot'}?start=${qrToken}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    const v = validateLoginForm(form);
    setErrors(v.errors);
    if (!v.valid) return;

    setLoading(true);
    try {
      await login(form);
      success('Tizimga muvaffaqiyatli kirdingiz!');
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      toastError(err.message || 'Email yoki parol xato!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!form.email) {
      info("Iltimos, avval email manzilingizni kiriting.");
      return;
    }
    success(`Parolni tiklash havolasi ${form.email} manziliga yuborildi! (Tez kunda)`);
  };

  return (
    <div className="fuzz-modal-backdrop">
      <div className="fuzz-login-modal">
        
        {/* Yopish (X) tugmasi */}
        <button 
          className="fuzz-modal-close" 
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Modal Sarlavhasi */}
        <div className="fuzz-modal-header">
          <img src="/image/logo.png" alt="Fuzz" />
          <h2>FUZZ</h2>
        </div>

        <div className="fuzz-modal-body">
          {/* Chap tomon: Forma */}
          <div className="fuzz-form-side">
            <h3 className="fuzz-title">Sign in</h3>
            
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="fuzz-checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="fuzz-links">
              <button onClick={handleForgotPassword} className="fuzz-link">Forgot password?</button>
            </div>
          </div>

          {/* O'ng tomon: QR Kod */}
          <div className="fuzz-qr-side">
            <h3 className="fuzz-title">Or sign in with QR</h3>
            <div className="fuzz-qr-box">
              <QRCodeSVG value={qrUrl} size={110} />
            </div>
            <p className="fuzz-qr-text">Use Telegram bot to sign in</p>
          </div>
        </div>

        <div className="fuzz-modal-footer">
          <span>Don't have an account?</span>
          <Link to="/register">Create a Free Account</Link>
        </div>
      </div>
    </div>
  );
}