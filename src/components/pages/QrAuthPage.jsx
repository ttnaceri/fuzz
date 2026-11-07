import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { authService } from '../services/authService.js';
import { storage } from '../utils/storage.js';

const TOKEN_RE = /^[a-f0-9]{64}$/;

export default function QrAuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const token = params.get('token') || '';
  const [state, setState] = useState('confirm'); // confirm | sending | approved | rejected | error
  const [errorMsg, setErrorMsg] = useState('');

  const hasSessionToken = Boolean(storage.getAuth()?.token);

  const reLogin = async () => {
    await logout();
    navigate('/login', { replace: true, state: { from: `/qr-auth?token=${token}` } });
  };

  const decide = async (approve) => {
    setState('sending');
    setErrorMsg('');
    try {
      await (approve ? authService.qrApprove(token) : authService.qrReject(token));
      setState(approve ? 'approved' : 'rejected');
    } catch (err) {
      if (err?.status === 401) { reLogin(); return; }
      setErrorMsg(err.message || 'Xato yuz berdi');
      setState('error');
    }
  };

  const box = { maxWidth: 420, margin: '2rem auto', padding: '2rem 1.5rem', background: '#241411', border: '1px solid #48201a', borderRadius: 8, color: '#f5eeee', textAlign: 'center' };
  const btn = { width: '100%', padding: '0.8rem', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', color: '#fff' };
  const primary = { ...btn, background: 'linear-gradient(90deg, #8a1200 0%, #3d0500 100%)' };
  const secondary = { ...btn, background: '#100b0a', border: '1px solid #48201a', color: '#b9a6a2', marginTop: '0.75rem' };

  if (loading) {
    return (
      <div style={box}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8a1200' }} />
        <p style={{ color: '#b9a6a2', marginTop: '1rem' }}>Tekshirilmoqda...</p>
      </div>
    );
  }

  if (!TOKEN_RE.test(token)) {
    return (
      <div style={box}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2.5rem', color: '#ed5555' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Invalid QR code</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>This link is not a valid Fuzz sign-in code.</p>
        <Link to="/qr-scan" style={{ ...primary, display: 'block', textDecoration: 'none', marginTop: '1.5rem', boxSizing: 'border-box' }}>Scan again</Link>
      </div>
    );
  }

  if (!hasSessionToken) {
    return (
      <div style={box}>
        <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Please sign in again</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>To confirm QR sign-in, sign in on this phone once more. You'll come back here automatically.</p>
        <button type="button" style={{ ...primary, marginTop: '1.5rem' }} onClick={reLogin}>Sign in</button>
      </div>
    );
  }

  if (state === 'approved') {
    return (
      <div style={box}>
        <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#4caf50' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Signed in</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
          Your computer is now signed in{user?.username ? ` as ${user.username}` : ''}.
        </p>
        <Link to="/" style={{ ...primary, display: 'block', textDecoration: 'none', marginTop: '1.5rem', boxSizing: 'border-box' }}>Done</Link>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div style={box}>
        <i className="fa-solid fa-ban" style={{ fontSize: '2.5rem', color: '#b9a6a2' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign-in declined</h3>
        <Link to="/" style={{ ...secondary, display: 'block', textDecoration: 'none', boxSizing: 'border-box' }}>Close</Link>
      </div>
    );
  }

  return (
    <div style={box}>
      <i className="fa-solid fa-desktop" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
      <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign in on another device?</h3>
      <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
        The device that shows this QR code will get access to <strong>{user?.username || 'your account'}</strong>. Only confirm if it's your own computer and you just opened the sign-in page.
      </p>

      {state === 'error' && (
        <div style={{ margin: '1rem 0 0', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {state === 'error' ? (
          <Link to="/qr-scan" style={{ ...primary, display: 'block', textDecoration: 'none', boxSizing: 'border-box' }}>Scan again</Link>
        ) : (
          <button type="button" style={primary} disabled={state === 'sending'} onClick={() => decide(true)}>
            {state === 'sending' ? 'Confirming...' : 'Yes, sign in'}
          </button>
        )}
        <button type="button" style={secondary} disabled={state === 'sending'} onClick={() => (state === 'error' ? navigate('/') : decide(false))}>
          {state === 'error' ? 'Close' : 'No, cancel'}
        </button>
      </div>
    </div>
  );
}