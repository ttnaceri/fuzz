import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function RegisterFormPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ email: '', confirmEmail: '', username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!/^[a-f0-9]{64}$/.test(token)) navigate('/register');
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.email !== form.confirmEmail) return toastError("Emaillar mos kelmadi!");
    if (form.password !== form.confirmPassword) return toastError("Parollar mos kelmadi!");
    if (form.password.length < 6) return toastError("Parol kamida 6 belgi!");
    setLoading(true);
    try {
      await api.post('/api/auth/register/complete', { token, username: form.username, email: form.email, password: form.password });
      success("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.");
      navigate('/login');
    } catch (err) {
      toastError(err?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#f5eeee', textAlign: 'center', marginBottom: '0.5rem' }}>Akkauntni yakunlash</h2>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ backgroundColor: 'rgba(67, 181, 129, 0.2)', color: '#43b581', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <i className="fa-solid fa-check-circle"></i> Telegram tasdiqlangan
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'confirmEmail', label: 'Email tasdiqlash', type: 'email' },
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'password', label: 'Parol', type: 'password' },
            { name: 'confirmPassword', label: 'Parolni tasdiqlash', type: 'password' },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: '1rem' }}>
              <input type={f.type} placeholder={f.label} value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} required />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
            {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
          </button>
        </form>
      </div>
    </div>
  );
}