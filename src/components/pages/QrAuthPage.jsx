import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { storage } from '../utils/storage.js';
import { config } from '../config/config.js';

const TOKEN_RE = /^[a-f0-9]{64}$/;

export default function QrAuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const token = params.get('token') || '';
  const [state, setState] = useState('confirm'); // confirm | sending | approved | rejected | error
  const [errorMsg, setErrorMsg] = useState('');
  const [showCheck, setShowCheck] = useState(false);

  const hasSessionToken = Boolean(storage.getAuth()?.token);

  // approved bo'lganda: 1.5s spinner → check → 1.2s → main sahifaga
  useEffect(() => {
    if (state !== 'approved') return;
    const t1 = setTimeout(() => setShowCheck(true), 1200);
    const t2 = setTimeout(() => navigate('/', { replace: true }), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state, navigate]);

  const reLogin = async () => {
    await logout();
    navigate('/login', { replace: true, state: { from: `/qr-auth?token=${token}` } });
  };

  const decide = async (approve) => {
    setState('sending');
    setErrorMsg('');

    const stored = storage.getAuth();
    const jwt = stored?.token;
    if (!jwt) {
      setErrorMsg('Sessiya topilmadi. Qaytadan login qiling.');
      setState('error');
      return;
    }

    const endpoint = approve ? 'approve' : 'reject';
    const url = `${config.apiBaseUrl}/api/auth/qr/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg('Sessiya yaroqsiz. Qaytadan login qiling.');
          setState('error');
          return;
        }
        setErrorMsg(data?.error || `HTTP ${res.status}`);
        setState('error');
        return;
      }

      setState(approve ? 'approved' : 'rejected');
    } catch (err) {
      setErrorMsg(err?.message || 'Tarmoq xatosi');
      setState('error');
    }
  };

  const box = { maxWidth: 420, margin: '2rem auto', padding: '2rem 1.5rem', background: '#241411', border: '1px solid #48201a', borderRadius: 8, color: '#f5eeee', textAlign: 'center' };
  const btn = { width: '100%', padding: '0.8rem', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', color: '#fff' };
  const primary = { ...btn, background: 'linear-gradient(90deg, #8a1200 0%, #3d0500 100%)' };
  const secondary = { ...btn, background: '#100b0a', border: '1px solid #48201a', color: '#b9a6a2', marginTop: '0.75rem' };

  // CSS animatsiyalar (inline <style>)
  const animationStyle = `
    @keyframes fuzz-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fuzz-pop-in {
      0%   { transform: scale(0.3); opacity: 0; }
      60%  { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fuzz-ring {
      0%   { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes fuzz-fade-up {
      0%   { transform: translateY(8px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `;

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
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Invalid QR</h3>
        <Link to="/qr-scanner" style={{ ...primary, display: 'block', textDecoration: 'none', marginTop: '1.5rem', boxSizing: 'border-box' }}>Scan again</Link>
      </div>
    );
  }

  if (!hasSessionToken) {
    return (
      <div style={box}>
        <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Please sign in again</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Sign in on this phone first. You'll come back here automatically.</p>
        <button type="button" style={{ ...primary, marginTop: '1.5rem' }} onClick={reLogin}>Sign in</button>
      </div>
    );
  }

  // ✅ YANGI: approved animatsiyasi
  if (state === 'approved') {
    return (
      <div style={box}>
        <style>{animationStyle}</style>

        <div
          style={{
            position: 'relative',
            width: 120,
            height: 120,
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!showCheck ? (
            // 1-qadam: aylanuvchi halqa
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid rgba(138, 18, 0, 0.15)',
                  borderTopColor: '#8a1200',
                  borderRadius: '50%',
                  animation: 'fuzz-spin 0.9s linear infinite',
                }}
              />
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.2rem', color: '#8a1200' }} />
            </>
          ) : (
            // 2-qadam: checkmark pop-in + ring
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid #4caf50',
                  borderRadius: '50%',
                  animation: 'fuzz-ring 1s ease-out forwards',
                }}
              />
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'rgba(76, 175, 80, 0.15)',
                  border: '3px solid #4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fuzz-pop-in 0.4s ease-out',
                }}
              >
                <i className="fa-solid fa-check" style={{ fontSize: '2.6rem', color: '#4caf50' }} />
              </div>
            </>
          )}
        </div>

        <h3 style={{ margin: '1rem 0 0.5rem', animation: 'fuzz-fade-up 0.3s ease-out' }}>
          {showCheck ? 'Tasdiqlandi!' : 'Tasdiqlanmoqda...'}
        </h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', animation: showCheck ? 'fuzz-fade-up 0.3s ease-out' : 'none' }}>
          {showCheck
            ? `Kompyuteringiz ${user?.username ? user.username + ' ' : ''}sifatida kirdi.`
            : 'Kompyuteringiz uchun sessiya yaratilmoqda...'}
        </p>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div style={box}>
        <i className="fa-solid fa-ban" style={{ fontSize: '2.5rem', color: '#b9a6a2' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Declined</h3>
        <Link to="/" style={{ ...secondary, display: 'block', textDecoration: 'none', boxSizing: 'border-box' }}>Close</Link>
      </div>
    );
  }

  return (
    <div style={box}>
      <i className="fa-solid fa-desktop" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
      <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign in on another device?</h3>
      <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
        The device that shows this QR code will get access to <strong>{user?.username || 'your account'}</strong>. Only confirm if it's your own computer.
      </p>

      {state === 'error' && (
        <div style={{ margin: '1rem 0 0', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {state === 'error' ? (
          <button type="button" style={primary} onClick={() => setState('confirm')}>Retry</button>
        ) : (
          <button type="button" style={primary} disabled={state === 'sending'} onClick={() => decide(true)}>
            {state === 'sending' ? 'Confirming...' : 'Yes, sign in'}
          </button>
        )}
        <button type="button" style={secondary} disabled={state === 'sending'} onClick={() => decide(false)}>
          No, cancel
        </button>
      </div>
    </div>
  );
}