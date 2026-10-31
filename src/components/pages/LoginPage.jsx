import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '../hooks/useToast.js';
import useAuth from '../hooks/useAuth.js';

export default function LoginPage() {
  const [qrToken] = useState('fuzz_qr_' + Math.random().toString(36).substring(7));
  const { success, error: toastError } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' },
    box: { backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', width: '100%', maxWidth: '750px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
    body: { display: 'flex', flexWrap: 'wrap', padding: '2rem', gap: '2rem' },
    formSide: { flex: '1 1 300px', display: 'flex', flexDirection: 'column' },
    qrSide: { flex: '0 1 280px', borderLeft: '1px solid #48201a', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
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
              <button type="submit" style={styles.btnPrimary} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            </form>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              <Link to="/reset-password" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Forgot password?</Link>
            </div>
          </div>
          <div style={styles.qrSide}>
            <h3 style={styles.title}>OR SIGN IN WITH QR</h3>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <QRCodeSVG value={qrUrl} size={150} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#b9a6a2', textAlign: 'center' }}>Use the <strong>Fuzz Mobile App</strong> to sign in</p>
          </div>
        </div>
        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={{ color: '#8a1200', fontWeight: '600', textDecoration: 'underline' }}>Create a Free Account</Link>
        </div>
      </div>
    </div>
  );
}