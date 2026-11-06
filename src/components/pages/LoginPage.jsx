import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';

export default function LoginPage() {
  const { success, error: toastError } = useToast();
  const { login, loginWithSession, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // QR token faqat bir marta yaratiladi, 30 soniyada yangilanadi
  const [qrToken, setQrToken] = useState('fuzz_qr_' + Math.random().toString(36).substring(7));
  useEffect(() => {
    const interval = setInterval(() => {
      setQrToken('fuzz_qr_' + Math.random().toString(36).substring(7));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const qrUrl = `https://fuzz-tau.vercel.app/qr-auth?token=${qrToken}`;

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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Stillar
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
    footer: { backgroundColor: '#19100e', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #48201a', fontSize: '0.85rem', color: '#b9a6a2' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <div style={styles.body}>
          
          {/* Chap tomon: Forma */}
          <div style={styles.formSide}>
            <h3 style={styles.title}>SIGN IN WITH ACCOUNT NAME</h3>
            
            {apiError && <div style={styles.errorBox}>{apiError}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="text" style={styles.input} placeholder="Account Name (Username)" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <input type="password" style={styles.input} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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

          {/* O'ng tomon: QR Kod */}
          <div style={styles.qrSide}>
            <h3 style={styles.title}>OR SIGN IN WITH QR</h3>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <QRCodeSVG value={qrUrl} size={150} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#b9a6a2', textAlign: 'center' }}>
              Use the <strong>Fuzz Mobile App</strong> to sign in
            </p>
          </div>

        </div>

        {/* Pastki qism */}
        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={{ color: '#8a1200', fontWeight: '600', textDecoration: 'underline' }}>Create a Free Account</Link>
        </div>
      </div>
    </div>
  );
}

const MAX_AUTO_REFRESH = 5;
const POLL_MS = 2000;

// Desktop: backendda QR sessiya yaratadi, holatini so'raydi va eskirsa yangilaydi
function DesktopQr({ onApproved, disabled }) {
  const [qr, setQr] = useState(null); // { token, expiresAt }
  const [state, setState] = useState('loading'); // loading | ready | expired | rejected | error
  const [errorMsg, setErrorMsg] = useState('');
  const autoRefreshes = useRef(0);
  const onApprovedRef = useRef(onApproved);
  onApprovedRef.current = onApproved;

  const createSession = useCallback(async () => {
    setState('loading');
    setErrorMsg('');
    try {
      const res = await authService.qrCreate();
      if (!res?.token) throw new Error('QR kod yaratilmadi');
      setQr({ token: res.token, expiresAt: res.expiresAt });
      setState('ready');
    } catch (err) {
      setQr(null);
      // 404 — backendda QR hali yo'q (deploy qilinmagan), 503 — sozlanmagan. Qayta urinishdan foyda yo'q.
      if (err?.status === 404 || err?.status === 503) {
        setState('unavailable');
        return;
      }
      setErrorMsg(err.message || 'QR kod yaratilmadi');
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (!disabled) createSession();
  }, [createSession, disabled]);

  // Holatni so'rash: setTimeout zanjiri — so'rovlar ustma-ust tushmaydi
  useEffect(() => {
    if (state !== 'ready' || !qr) return;
    let cancelled = false;
    let timer;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() >= qr.expiresAt) {
        setState('expired');
        return;
      }
      try {
        const res = await authService.qrStatus(qr.token);
        if (cancelled) return;
        if (res?.status === 'approved' && res.user) {
          onApprovedRef.current(res.user, res.token);
          return;
        }
        if (res?.status === 'expired') { setState('expired'); return; }
        if (res?.status === 'rejected') { setState('rejected'); return; }
      } catch {
        // Tarmoq xatosi — keyingi urinishda davom etamiz
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    };

    timer = setTimeout(poll, POLL_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [state, qr]);

  // Eskirganda avtomatik yangilash (faqat sahifa ko'rinib turganda va cheklangan marta)
  useEffect(() => {
    if (state !== 'expired') return;
    if (document.visibilityState === 'visible' && autoRefreshes.current < MAX_AUTO_REFRESH) {
      autoRefreshes.current += 1;
      createSession();
    }
  }, [state, createSession]);

  const manualRefresh = () => {
    autoRefreshes.current = 0;
    createSession();
  };

  if (disabled) {
    return <p style={{ fontSize: '0.85rem', color: '#b9a6a2', textAlign: 'center' }}>You are already signed in.</p>;
  }

  const qrUrl = qr ? `${window.location.origin}/qr-auth?token=${qr.token}` : '';
  const showOverlay = state !== 'ready';

  return (
    <>
      <div style={{ position: 'relative', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0', width: 150, height: 150, boxSizing: 'content-box' }}>
        {qr && <QRCodeSVG value={qrUrl} size={150} style={{ opacity: showOverlay ? 0.1 : 1 }} />}
        {showOverlay && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', textAlign: 'center', color: '#241411', fontSize: '0.8rem' }}>
            {state === 'loading' && <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem' }} />}
            {state === 'unavailable' && (
              <span>QR sign-in is temporarily unavailable. Please use your username and password.</span>
            )}
            {state !== 'loading' && state !== 'unavailable' && (
              <>
                <span>
                  {state === 'expired' && 'QR code expired'}
                  {state === 'rejected' && 'Sign-in was declined on the phone'}
                  {state === 'error' && (errorMsg || 'Could not load QR code')}
                </span>
                <button type="button" onClick={manualRefresh} style={{ padding: '0.4rem 0.8rem', border: 'none', borderRadius: 4, background: '#8a1200', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Refresh
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.8rem', color: '#b9a6a2', textAlign: 'center' }}>
        Open Fuzz on your phone, tap the <i className="fa-solid fa-qrcode" /> button and scan this code — or just scan it with your phone camera.
      </p>
    </>
  );
}
