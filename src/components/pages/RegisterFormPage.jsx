import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function RegisterFormPage() {
  const [form, setForm] = useState({ email: '', confirmEmail: '', username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const tgId = sessionStorage.getItem('reg_tg_id');

  useEffect(() => {
    if (!tgId) navigate('/register');
  }, [tgId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.email !== form.confirmEmail) return toastError("Emaillar mos kelmadi!");
    if (form.password !== form.confirmPassword) return toastError("Parollar mos kelmadi!");
    
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        telegramId: tgId
      });
      success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      sessionStorage.removeItem('reg_tg_id');
      navigate('/account');
    } catch (err) {
      toastError(err.message || 'Ro\'yxatdan o\'tishda xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#100b0a', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', border: '1px solid #48201a' }}>
        <h2 style={{ color: '#8a1200', textAlign: 'center', marginBottom: '1.5rem' }}>Complete Registration</h2>
        <form onSubmit={handleSubmit}>
          {[
            { name: 'email', label: 'Email Address', type: 'email' },
            { name: 'confirmEmail', label: 'Confirm Email', type: 'email' },
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password' }
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: '1rem' }}>
              <input
                type={field.type}
                placeholder={field.label}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
            {loading ? 'Processing...' : 'Finish Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}