import { useState, useEffect, useRef, useCallback, Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';
import { api } from '../services/api.js';
import { config } from '../config/config.js';

class QRBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: '#ed5555', padding: '1rem' }}>QR kodni yuklashda xatolik.</div>;
    }
    return this.props.children;
  }
}

const getQrOrigin = () => {
  if (typeof window === 'undefined') return 'https://fuzz-tau.vercel.app';
  return window.location.origin;
};

const POLL_INTERVAL_MS = 2000;

export default function LoginPage() {
  const { success, error: toastError } = useToast();
  const { login, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 1024);

  const [qrToken, setQrToken] = useState('');
  const [qrError, setQrError] = useState('');
  const [qrStatus, setQrStatus] = useState('initializing');
  const pollRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const createQrChallenge = useCallback(async () => {
    setQrStatus('initializing');
    setQrError('');
    try {
      const res = await api.post('/api/auth/qr/create', {});
      if (!isMountedRef.current) return;
      if (!res?.token) {
        setQrStatus('error');
        setQrError('QR kod yaratilmadi');
        return;
      }
      setQrToken(res.token);
      setQrStatus('pending');
    } catch (err) {
      if (!isMountedRef.current) return;
      setQrStatus('error');
      setQrError(err?.message || 'QR kodni yaratishda xato');
    }
  }, []);

  const pollStatus = useCallback(async (token) => {
    try {
      const res = await api.get('/api/auth/qr/status', { params: { token } });
      if (!isMountedRef.current) return;

      if (res?.status === 'approved' && res?.token && res?.user) {
        setSession(res.user, res.token);
        success(`Tizimga kirdingiz: ${res.user.username}`);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setQrStatus('approved');
        navigate(location.state?.from || '/account', { replace: true });
        return;
      }

      if (res?.status === 'expired' || res?.status === 'consumed') {
        setQrStatus('expired');
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setTimeout(() => { if (isMountedRef.current) createQrChallenge(); }, 1500);
        return;
      }

      setQrStatus('pending');
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err?.status === 400) {
        setQrStatus('error');
        setQrError(err.message || 'QR tokenda xato');
        return;
      }
      console.warn('QR poll xatosi (davom etadi):', err?.message);
    }
  }, [setSession, success, navigate, location.state, createQrChallenge]);

  useEffect(() => {
    isMountedRef.current = true;
    if (isMobile) return;
    if (!qrToken) { createQrChallenge(); return; }
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => pollStatus(qrToken), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [qrToken, isMobile, createQrChallenge, pollStatus]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!form.username || !form.password) {
      setApiError("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setLoading(true);
    try {
      await login(form);
      success('Tizimga muvaffaqiyatli kirdingiz!');
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Xato yuz berdi');
      toastError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = qrToken ? `${getQrOrigin()}${config.qrLogin.path}?token=${qrToken}` : '';

  const styles = {
    wrapper: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' },
    box: { backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', width: '100%', maxWidth: '800px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
    body: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', padding: '2rem', gap: '2rem' },
    formSide: { flex: '1 1 300px', display: 'flex', flexDirection: 'column' },
    qrSide: { flex: '0 1 280px', borderLeft: isMobile ? 'none' : '1px solid #48201a', borderTop: isMobile ? '1px solid #48201a' : 'none', paddingLeft: isMobile ? '0' : '2rem', paddingTop: isMobile ? '2rem' : '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    title: { color: '#8a1200', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontWeight: '700' },
    input: { width: '100%', padding: '0.8rem 1rem', backgroundColor: '#100b0a', border: '1px solid #48201a', borderRadius: '4px', color: '#f5eeee', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' },
    errorBox: { backgroundColor: 'rgba(237, 85, 85, 0.1)', border: '1px solid #ed5555', padding: '0.8rem', borderRadius: '4px', color: '#ed5555', marginBottom: '1rem', fontSize: '0.85rem' },
    btnPrimary: { width: '100%', padding: '0.8rem', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', background: 'linear-gradient(90deg, #8a1200 0%, #3d0500 100%)' },
    footer: { backgroundColor: '#19100e', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #48201a', fontSize: '0.85rem', color: '#b9a6a2' },
    qrBox: { backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0', position: 'relative' },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <div style={styles.body}>

          <div style={styles.formSide}>
            <h3 style={styles.title}>SIGN IN WITH ACCOUNT NAME</h3>
            {apiError && <div style={styles.errorBox}>{apiError}</div>}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="text" style={styles.input} placeholder="Account Name (Username)" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="password" style={styles.input} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', color: '#b9a6a2', fontSize: '0.85rem' }}>
                <input type="checkbox" id="remember" style={{ accentColor: '#8a1200' }} />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              <Link to="/reset-password" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Forgot password?</Link>
            </div>
          </div>

          {!isMobile && (
            <div style={styles.qrSide}>
              <h3 style={styles.title}>OR SIGN IN WITH QR</h3>
              <QRBoundary>
                <div style={styles.qrBox}>
                  {qrStatus === 'pending' && qrUrl && (
                    <QRCodeSVG value={qrUrl} size={150} />
                  )}
                  {qrStatus === 'initializing' && (
                    <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241411' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
                    </div>
                  )}
                  {(qrStatus === 'error' || qrStatus === 'expired') && (
                    <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a1200', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>
                      {qrStatus === 'expired' ? 'QR kod eskirgan. Yangilanmoqda...' : (qrError || 'QR xatosi')}
                    </div>
                  )}
                </div>
              </QRBoundary>
              <p style={{ fontSize: '0.8rem', color: '#b9a6a2', textAlign: 'center', lineHeight: 1.4 }}>
                Open <strong>Fuzz</strong> on your phone, tap the QR button and scan this code.
              </p>
              {qrStatus === 'pending' && (
                <p style={{ fontSize: '0.7rem', color: '#6b524e', marginTop: '0.5rem' }}>Kod 2 daqiqa amal qiladi</p>
              )}
              {qrStatus === 'error' && (
                <button
                  type="button"
                  onClick={createQrChallenge}
                  style={{ marginTop: '0.5rem', background: 'transparent', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Qayta urinish
                </button>
              )}
            </div>
          )}

        </div>

        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={{ color: '#8a1200', fontWeight: '600', textDecoration: 'underline' }}>Create a Free Account</Link>
        </div>
      </div>
    </div>
  );
}