import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

const SUCCESS_ANIM_ID = 'fuzz-reg-confirm-anim';
if (typeof document !== 'undefined' && !document.getElementById(SUCCESS_ANIM_ID)) {
  const s = document.createElement('style');
  s.id = SUCCESS_ANIM_ID;
  s.textContent = `
    @keyframes rqSpin { to { transform: rotate(360deg); } }
    @keyframes rqFade { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes rqCheck { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
    @keyframes rqPulse { 0% { box-shadow: 0 0 0 0 rgba(76,175,80,0.5); } 70% { box-shadow: 0 0 0 24px rgba(76,175,80,0); } 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); } }
    .rq-spin { width: 64px; height: 64px; border-radius: 50%; border: 4px solid rgba(138,18,0,0.2); border-top-color: #8a1200; animation: rqSpin 900ms linear infinite; }
    .rq-check { width: 72px; height: 72px; border-radius: 50%; background: #4caf50; display: flex; align-items: center; justify-content: center; animation: rqFade 400ms ease-out, rqPulse 1200ms ease-out; }
    .rq-check path { stroke: #fff; stroke-width: 4; fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 100; stroke-dashoffset: 100; animation: rqCheck 400ms 200ms ease-out forwards; }
  `;
  document.head.appendChild(s);
}

export default function RegisterConfirmPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [phase, setPhase] = useState('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setErrorMsg('Bu sahifa faqat Telegram orqali ochilishi kerak.');
      setPhase('error');
      return;
    }

    tg.ready();
    tg.expand();

    const initData = tg.initData || '';
    setPhase('confirming');

    api.post('/api/auth/register/confirm', { token, initData })
      .then((res) => {
        setPhase('success');
        setTimeout(() => {
          try { tg.close(); } catch {}
        }, 1500);
      })
      .catch((err) => {
        setErrorMsg(err?.message || 'Tasdiqlashda xato');
        setPhase('error');
      });
  }, [token, navigate]);

  const box = { minHeight: '100vh', backgroundColor: '#100b0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#f5eeee', textAlign: 'center' };

  return (
    <div style={box}>
      {(phase === 'checking' || phase === 'confirming') && (
        <>
          <div className="rq-spin" />
          <p style={{ marginTop: '1.5rem', color: '#b9a6a2' }}>Tasdiqlanmoqda...</p>
        </>
      )}
      {phase === 'success' && (
        <>
          <div className="rq-check">
            <svg viewBox="0 0 40 40" width="40" height="40"><path d="M10 20 L17 27 L30 14" /></svg>
          </div>
          <h2 style={{ marginTop: '1.2rem' }}>Tasdiqlandi</h2>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Kompyuteringizda davom eting</p>
        </>
      )}
      {phase === 'error' && (
        <>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ed5555' }} />
          <h2 style={{ marginTop: '1rem' }}>Xato</h2>
          <p style={{ color: '#b9a6a2', fontSize: '0.9rem', maxWidth: 320 }}>{errorMsg}</p>
        </>
      )}
    </div>
  );
}