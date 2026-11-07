import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ username: '', email: '', telegramId: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const filled = [form.username, form.email, form.telegramId].filter((v) => v.trim()).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (filled < 2) return toastError('Kamida 2 ta maydonni to\'ldiring');
    setLoading(true);
    try {
      await api.post('/api/auth/reset/start', { username: form.username, email: form.email, telegramId: form.telegramId });
      success('Kod Telegramingizga yuborildi!');
      sessionStorage.setItem('reset_username', form.username);
      navigate('/reset-password/verify');
    } catch (err) {
      toastError(err?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '1rem' }}>Parolni Tiklash</h2>
        <p style={{ color: '#b9a6a2', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Kamida 2 ta maydonni to'ldiring. Telegramingizga kod yuboramiz.
        </p>
        <form onSubmit={handleSubmit}>
          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telegramId', label: 'Telegram ID', type: 'text' },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: '1rem' }}>
              <input type={f.type} placeholder={f.label} value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
          ))}
          <p style={{ color: '#6b524e', fontSize: '0.75rem', marginBottom: '0.8rem' }}>{filled}/2 minimum</p>
          <button type="submit" disabled={loading || filled < 2} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading || filled < 2 ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: loading || filled < 2 ? 0.6 : 1 }}>
            {loading ? 'Yuborilmoqda...' : 'Kodni yuborish'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#b9a6a2', textDecoration: 'underline' }}>Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  );
}