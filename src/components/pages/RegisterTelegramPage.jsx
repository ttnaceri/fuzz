import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

const POLL_MS = 2000;

export default function RegisterTelegramPage() {
  const [tgId, setTgId] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle | waiting | confirmed | expired
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    if (!token || status !== 'waiting') return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get('/api/auth/register/status', { params: { token } });
        if (res?.status === 'confirmed') {
          clearInterval(pollRef.current); pollRef.current = null;
          setStatus('confirmed');
          success('Telegram tasdiqlandi!');
          navigate(`/register/form?token=${token}`);
        } else if (res?.status === 'expired') {
          clearInterval(pollRef.current); pollRef.current = null;
          setStatus('expired');
          setErrorMsg('Havola eskirgan. Qayta yuboring.');
        }
      } catch (e) {}
    }, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, status, navigate, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = tgId.replace(/\D/g, '');
    if (!clean) return toastError("Telegram ID raqamingizni kiriting!");
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register/start', { telegramId: clean });
      setToken(res.token);
      setStatus('waiting');
      success("Botga havola yuborildi. Telegram'da tasdiqlang.");
    } catch (err) {
      setErrorMsg(err?.message || 'Xato');
      toastError(err?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Telegram orqali ro'yxatdan o'tish</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Telegram ID raqamingizni kiriting. Botga tasdiqlash havolasi yuboriladi.
        </p>

        {status === 'idle' || status === 'expired' ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text" placeholder="Telegram ID" value={tgId}
              onChange={(e) => setTgId(e.target.value.replace(/\D/g, '').slice(0, 15))}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '3px', marginBottom: '1rem' }}
            />
            {errorMsg && <p style={{ color: '#ed5555', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{errorMsg}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Yuborilmoqda...' : 'Havolani yuborish'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#8a1200' }} />
            <p style={{ color: '#f5eeee', marginTop: '1rem' }}>Telegram'da tasdiqlang</p>
            <p style={{ color: '#b9a6a2', fontSize: '0.85rem' }}>@FuzzAppBot ga yuborilgan havolani bosing</p>
            <button onClick={() => { setStatus('idle'); setToken(''); }} style={{ marginTop: '1rem', background: 'transparent', color: '#b9a6a2', border: '1px solid #48201a', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>
              Bekor qilish
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  );
}