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

  const [state, setState] = useState('confirm'); // confirm | guest_hours | pending_code | sending | approved | rejected | error
  const [errorMsg, setErrorMsg] = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const [guestHours, setGuestHours] = useState(1);
  const [code, setCode] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');

  const hasSessionToken = Boolean(storage.getAuth()?.token);

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

  const getJwt = () => storage.getAuth()?.token;

  const callApi = async (endpoint, body) => {
    const jwt = getJwt();
    if (!jwt) throw new Error('Sessiya topilmadi. Qaytadan login qiling.');

    const res = await fetch(`${config.apiBaseUrl}/api/auth/qr/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  };

  // 1. Rejim tanlash
  const chooseMode = async (mode, label) => {
    if (mode === 'guest') {
      setSelectedLabel(label);
      setState('guest_hours');
      return;
    }

    setSelectedLabel(label);
    setErrorMsg('');

    if (mode === 'my_device') {
      // Kod yuborish
      setState('sending');
      try {
        await callApi('approve', { token, mode: 'my_device' });
        setState('pending_code');
      } catch (err) {
        setErrorMsg(err.message);
        setState('error');
      }
      return;
    }

    // Boshqa rejimlar — darhol tasdiqlash
    setState('sending');
    try {
      await callApi('approve', { token, mode });
      setState('approved');
    } catch (err) {
      setErrorMsg(err.message);
      setState('error');
    }
  };

  // 2. Guest session (vaqt tanlash)
  const confirmGuest = async () => {
    setState('sending');
    setErrorMsg('');
    try {
      await callApi('approve', { token, mode: 'guest', guestHours });
      setState('approved');
    } catch (err) {
      setErrorMsg(err.message);
      setState('error');
    }
  };

  // 3. 2 xonali kodni tasdiqlash
  const verifyCode = async () => {
    setState('sending');
    setErrorMsg('');
    try {
      await callApi('verify-code', { token, code });
      setState('approved');
    } catch (err) {
      setErrorMsg(err.message);
      setState('pending_code');
    }
  };

  // 4. Rad etish
  const reject = async () => {
    setState('sending');
    setErrorMsg('');
    try {
      await callApi('reject', { token });
      setState('rejected');
    } catch (err) {
      setErrorMsg(err.message);
      setState('error');
    }
  };

  const box = { maxWidth: 480, margin: '2rem auto', padding: '2rem 1.5rem', background: '#241411', border: '1px solid #48201a', borderRadius: 8, color: '#f5eeee', textAlign: 'center' };
  const btn = { width: '100%', padding: '0.85rem 1rem', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', color: '#fff', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' };
  const primary = { ...btn, background: 'linear-gradient(90deg, #8a1200 0%, #3d0500 100%)' };
  const secondary = { ...btn, background: '#100b0a', border: '1px solid #48201a', color: '#f5eeee' };
  const danger = { ...btn, background: '#100b0a', border: '1px solid #ed5555', color: '#ed5555' };
  const input = { width: '100%', padding: '0.9rem', background: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: 4, boxSizing: 'border-box' };

  const animationStyle = `
    @keyframes fuzz-spin { to { transform: rotate(360deg); } }
    @keyframes fuzz-pop-in { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes fuzz-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
    @keyframes fuzz-fade-up { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
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

  // ==========================================
  // APPROVED animatsiyasi
  // ==========================================
  if (state === 'approved') {
    return (
      <div style={box}>
        <style>{animationStyle}</style>
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!showCheck ? (
            <>
              <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(138, 18, 0, 0.15)', borderTopColor: '#8a1200', borderRadius: '50%', animation: 'fuzz-spin 0.9s linear infinite' }} />
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.2rem', color: '#8a1200' }} />
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid #4caf50', borderRadius: '50%', animation: 'fuzz-ring 1s ease-out forwards' }} />
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(76, 175, 80, 0.15)', border: '3px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fuzz-pop-in 0.4s ease-out' }}>
                <i className="fa-solid fa-check" style={{ fontSize: '2.6rem', color: '#4caf50' }} />
              </div>
            </>
          )}
        </div>
        <h3 style={{ margin: '1rem 0 0.5rem', animation: 'fuzz-fade-up 0.3s ease-out' }}>
          {showCheck ? 'Tasdiqlandi!' : 'Tasdiqlanmoqda...'}
        </h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>
          {showCheck
            ? `Kompyuteringiz ${user?.username ? user.username + ' ' : ''}sifatida kirdi.`
            : 'Kompyuteringiz uchun sessiya yaratilmoqda...'}
        </p>
        {showCheck && selectedLabel && (
          <p style={{ color: '#43b581', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            <i className="fa-solid fa-circle-info"></i> Sessiya: {selectedLabel}
          </p>
        )}
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div style={box}>
        <i className="fa-solid fa-ban" style={{ fontSize: '2.5rem', color: '#b9a6a2' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Declined</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Desktop'da login bo'lmadi.</p>
        <Link to="/" style={{ ...secondary, display: 'block', textDecoration: 'none', boxSizing: 'border-box', marginTop: '1rem' }}>Close</Link>
      </div>
    );
  }

  // ==========================================
  // PENDING CODE (My Device)
  // ==========================================
  if (state === 'pending_code') {
    return (
      <div style={box}>
        <i className="fa-brands fa-telegram" style={{ fontSize: '2.5rem', color: '#0088cc' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Telegram'ga kod yuborildi</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          @FuzzAppBot ga yuborilgan <strong>2 xonali kodni</strong> kiriting.
          <br />
          <span style={{ color: '#f0b44d', fontSize: '0.8rem' }}>⏱ Kod 1 daqiqa amal qiladi.</span>
        </p>

        {errorMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
          placeholder="00"
          maxLength={2}
          autoFocus
          style={{ ...input, textAlign: 'center', fontSize: '2.5rem', letterSpacing: '1rem', padding: '1rem', marginBottom: '1rem' }}
        />

        <button
          type="button"
          style={primary}
          disabled={code.length !== 2}
          onClick={verifyCode}
        >
          <i className="fa-solid fa-check" />
          <span style={{ flex: 1 }}>Tasdiqlash</span>
        </button>

        <button
          type="button"
          style={{ ...secondary, marginTop: '0.6rem', justifyContent: 'center' }}
          onClick={() => { setCode(''); setErrorMsg(''); setState('confirm'); }}
        >
          Bekor qilish
        </button>
      </div>
    );
  }

  // ==========================================
  // GUEST HOURS tanlash
  // ==========================================
  if (state === 'guest_hours') {
    return (
      <div style={box}>
        <i className="fa-solid fa-user-clock" style={{ fontSize: '2.5rem', color: '#43b581' }} />
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Guest Session</h3>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Sessiya qancha vaqt davom etsin? <br />
          <span style={{ color: '#f0b44d', fontSize: '0.8rem' }}>Maksimal: 72 soat.</span>
        </p>

        {errorMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="range"
            min="1"
            max="72"
            value={guestHours}
            onChange={(e) => setGuestHours(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#8a1200' }}
          />
          <div style={{ minWidth: '80px', color: '#43b581', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>
            {guestHours} soat
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[1, 6, 12, 24, 48, 72].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setGuestHours(h)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 4,
                border: '1px solid #48201a',
                background: guestHours === h ? '#8a1200' : '#100b0a',
                color: '#f5eeee',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {h}h
            </button>
          ))}
        </div>

        <p style={{ color: '#b9a6a2', fontSize: '0.75rem', marginBottom: '1rem' }}>
          ⚠️ {guestHours} soatdan keyin <strong>avtomatik chiqadi</strong>.
        </p>

        <button
          type="button"
          style={primary}
          onClick={confirmGuest}
        >
          <i className="fa-solid fa-check" />
          <span style={{ flex: 1 }}>{guestHours} soatga ruxsat berish</span>
        </button>
        <button
          type="button"
          style={{ ...secondary, marginTop: '0.6rem', justifyContent: 'center' }}
          onClick={() => setState('confirm')}
        >
          Bekor qilish
        </button>
      </div>
    );
  }

  // ==========================================
  // CONFIRM (asosiy 5 ta tugma)
  // ==========================================
  return (
    <div style={box}>
      <i className="fa-solid fa-desktop" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
      <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign in on another device?</h3>
      <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        The device that shows this QR code will get access to <strong>{user?.username || 'your account'}</strong>.
        <br />
        Choose how long this session should stay signed in.
      </p>

      {state === 'error' && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: 4, border: '1px solid #ed5555', color: '#ed5555', background: 'rgba(237,85,85,0.1)', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
        <button type="button" style={primary} disabled={state === 'sending'} onClick={() => chooseMode('my_device', 'My Device')}>
          <i className="fa-solid fa-mobile-screen" style={{ width: 20 }} />
          <span style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>My Device</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.85 }}>
              Cheksiz (Sign Out qilmaguncha) · Telegram kod bilan
            </div>
          </span>
        </button>

        <button type="button" style={primary} disabled={state === 'sending'} onClick={() => chooseMode('fuzz_client', 'Fuzz Client')}>
          <i className="fa-solid fa-desktop" style={{ width: 20 }} />
          <span style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Fuzz Client</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.85 }}>
              Cheksiz (Sign Out qilmaguncha)
            </div>
          </span>
        </button>

        <button type="button" style={secondary} disabled={state === 'sending'} onClick={() => chooseMode('guest', 'Guest Session')}>
          <i className="fa-solid fa-user-clock" style={{ width: 20 }} />
          <span style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Guest Session</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>
              1 daqiqa – 72 soat (o'zingiz tanlaysiz)
            </div>
          </span>
        </button>

        <button type="button" style={secondary} disabled={state === 'sending'} onClick={() => chooseMode('single_use', 'Single Use')}>
          <i className="fa-solid fa-clock" style={{ width: 20 }} />
          <span style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Single Use</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>
              5 daqiqa · bitta harakat uchun
            </div>
          </span>
        </button>

        <button type="button" style={{ ...danger, marginTop: '0.5rem', justifyContent: 'center' }} disabled={state === 'sending'} onClick={reject}>
          <i className="fa-solid fa-ban" />
          <span>Cancel (Rad etish)</span>
        </button>
      </div>
    </div>
  );
}