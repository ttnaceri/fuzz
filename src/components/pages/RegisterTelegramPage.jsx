import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function RegisterTelegramPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState(1); // 1: tg id, 2: kod, 3: forma
  const [telegramId, setTelegramId] = useState('');
  const [code, setCode] = useState('');
  const [form, setForm] = useState({ username: '', email: '', confirmEmail: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [blockedMinutes, setBlockedMinutes] = useState(0);

  // ============ 1-QADAM: Telegram ID ============
  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = telegramId.replace(/\D/g, '');
    if (!clean) return toastError('Telegram ID kiriting');
    setLoading(true);
    try {
      await api.post('/api/auth/register/start', { telegramId: clean });
      success('Kod Telegramingizga yuborildi!');
      setStep(2);
    } catch (err) {
      setErrorMsg(err?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  };

  // ============ 2-QADAM: 2 xonali kod ============
  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (code.length !== 2) return toastError('2 xonali kodni kiriting');
    setLoading(true);
    try {
      await api.post('/api/auth/register/verify', { telegramId: telegramId.replace(/\D/g, ''), code });
      success('Kod tasdiqlandi!');
      setStep(3);
    } catch (err) {
      setErrorMsg(err?.message || 'Xato');
      // Blok bo'lsa
      if (err?.status === 429) {
        const m = err?.message?.match(/(\d+)\s*daqiqa/);
        if (m) setBlockedMinutes(parseInt(m[1], 10));
      }
    } finally {
      setLoading(false);
    }
  };

  // Avto-tasdiqlash effekti (kod 2 xonali bo'lganda)
  useEffect(() => {
    if (step === 2 && code.length === 2 && !loading) {
      handleVerifyCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step]);

  // ============ 3-QADAM: Forma ============
  const handleComplete = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (form.email !== form.confirmEmail) return toastError('Emaillar mos kelmadi');
    if (form.password !== form.confirmPassword) return toastError('Parollar mos kelmadi');
    if (form.password.length < 6) return toastError('Parol kamida 6 belgi');
    setLoading(true);
    try {
      await api.post('/api/auth/register/complete', {
        telegramId: telegramId.replace(/\D/g, ''),
        username: form.username,
        email: form.email,
        password: form.password,
      });
      success('Ro\'yxatdan o\'tdingiz! Endi login qiling.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem', backgroundColor: '#100b0a',
    border: '1px solid #48201a', color: '#fff', borderRadius: '4px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid #48201a' }}>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '0.85rem',
              backgroundColor: step >= s ? '#8a1200' : '#100b0a',
              color: step >= s ? '#fff' : '#6b524e',
              border: `1px solid ${step >= s ? '#8a1200' : '#48201a'}`,
            }}>{s}</div>
          ))}
        </div>

        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '0.5rem' }}>
          {step === 1 && "Telegram orqali ro'yxatdan o'tish"}
          {step === 2 && "Tasdiqlash kodi"}
          {step === 3 && "Akkauntni yakunlash"}
        </h2>

        <p style={{ color: '#b9a6a2', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          {step === 1 && "Telegram ID raqamingizni kiriting. Botga 2 xonali kod yuboriladi."}
          {step === 2 && "Telegramingizga yuborilgan 2 xonali kodni kiriting."}
          {step === 3 && "Username, email va parolingizni kiriting."}
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(237,85,85,0.1)', border: '1px solid #ed5555', padding: '0.8rem', borderRadius: '4px', color: '#ed5555', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMsg}
            {blockedMinutes > 0 && <div style={{ marginTop: '0.3rem', fontWeight: 'bold' }}>Blok: {blockedMinutes} daqiqa</div>}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Telegram ID raqamingiz"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, '').slice(0, 15))}
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '3px' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Yuborilmoqda...' : 'Kodni yuborish'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="00"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem' }}
                maxLength={2}
                autoFocus
              />
            </div>
            <p style={{ color: '#6b524e', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.8rem' }}>
              Kod kiritilishi bilan avtomatik tasdiqlanadi
            </p>
            <button type="submit" disabled={loading || code.length !== 2} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: (loading || code.length !== 2) ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: (loading || code.length !== 2) ? 0.6 : 1 }}>
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
            <button type="button" onClick={() => { setStep(1); setCode(''); setErrorMsg(''); }} style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem', backgroundColor: 'transparent', color: '#b9a6a2', border: '1px solid #48201a', borderRadius: '4px', cursor: 'pointer' }}>
              Kodni qayta yuborish
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleComplete}>
            {[
              { name: 'username', label: 'Username', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'confirmEmail', label: 'Email tasdiqlash', type: 'email' },
              { name: 'password', label: 'Parol', type: 'password' },
              { name: 'confirmPassword', label: 'Parolni tasdiqlash', type: 'password' },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: '1rem' }}>
                <input
                  type={f.type}
                  placeholder={f.label}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  );
}