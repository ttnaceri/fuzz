import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService.js';
import useToast from '../hooks/useToast.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();
  
  const [step, setStep] = useState(1); // 1: ID kiritish, 2: Botni kutish, 3: Forma
  const [loading, setLoading] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  
  const [form, setForm] = useState({ email: '', emailConfirm: '', username: '', password: '', confirm: '' });

  // Agar Botdagi App (WebApp) orqali qaytgan bo'lsa, 3-bosqichga o'tkazamiz
  useEffect(() => {
    const tgId = searchParams.get('tgId');
    if (tgId) {
      setTelegramId(tgId);
      setStep(3); 
    }
  }, [searchParams]);

  // 1-BOSQICH: Botga xabar yuborish
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!telegramId) return toastError("Telegram ID kiriting!");
    setLoading(true);
    try {
      await authService.registerInit(telegramId);
      setStep(2);
      success("Telegramingizga xabar yuborildi.");
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // 2-BOSQICH: Tasdiqlanganini kutish (Polling)
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(async () => {
      try {
        const res = await authService.checkVerifyStatus(telegramId);
        if (res && res.verified) {
          clearInterval(interval);
          setStep(3);
          success("Tasdiqlandi! Endi formani to'ldiring.");
        }
      } catch (err) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [step, telegramId, success]);

  // 3-BOSQICH: Ro'yxatdan o'tishni yakunlash
  const handleComplete = async (e) => {
    e.preventDefault();
    if (!form.email.includes('@') || !form.email.includes('.com')) return toastError("Emailda '@' va '.com' bo'lishi shart!");
    if (form.email !== form.emailConfirm) return toastError("Emaillar mos kelmadi!");
    if (form.password !== form.confirm) return toastError("Parollar mos kelmadi!");

    setLoading(true);
    try {
      await authService.registerComplete({ telegramId, ...form });
      success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/'); // Home Page ga o'tadi
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 className="text-center">Ro'yxatdan o'tish</h1>
      
      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <p className="text-muted mb-2 text-center">Telegram ID ingizni kiriting.</p>
          <div className="form-group">
            <label className="form-label">Telegram ID</label>
            <input type="text" className="form-input" placeholder="Masalan: 123456789" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Yuborilmoqda...' : 'Botga yuborish'}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="text-center">
          <i className="fa-brands fa-telegram" style={{ fontSize: '4rem', color: '#0088cc', margin: '1rem 0' }} />
          <h3>Telegramni tekshiring</h3>
          <p className="text-muted mb-2">Botdagi ilovani (App) bosing va "Success" chiqishini kuting.</p>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleComplete}>
          <div style={{ background: 'rgba(67, 181, 129, 0.1)', border: '1px solid #43b581', color: '#43b581', padding: '10px', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center' }}>
            <i className="fa-solid fa-check-circle" /> Telegram tasdiqlandi!
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email (takrorlang)</label>
            <input type="email" className="form-input" value={form.emailConfirm} onChange={e => setForm({...form, emailConfirm: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Parol</label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Parol (takrorlang)</label>
            <input type="password" className="form-input" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>
      )}
    </div>
  );
}