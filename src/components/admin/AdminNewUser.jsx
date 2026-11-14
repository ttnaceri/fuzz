import { useState } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/useLanguage.js';
import useToast from '../hooks/useToast.js';

export default function AdminNewUser() {
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', balance: '0' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      return toastError(t('common.error') || 'Barcha maydonlarni to\'ldiring');
    }

    setLoading(true);
    try {
      // Backendda admin uchun alohida endpoint bo'lmasa, oddiy register ishlatamiz
      await api.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        // telegramId ni bo'sh qoldiramiz, chunki bu admin yaratayotgan user
      });
      success(t('common.success') || 'Foydalanuvchi yaratildi!');
      setForm({ username: '', email: '', password: '', balance: '0' });
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>
        <i className="fa-solid fa-user-plus"></i> {t('admin.addUser') || 'Yangi foydalanuvchi qo\'shish'}
      </h1>

      <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{t('profile.username') || 'Username'}</label>
            <input
              type="text"
              className="form-input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{t('profile.email') || 'Email'}</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{t('profile.password') || 'Parol'}</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{t('wallet.balance') || 'Balans ($)'}</label>
            <input
              type="number"
              className="form-input"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? t('common.loading') : (t('admin.createUser') || 'Yaratish')}
          </button>
        </form>
      </div>
    </div>
  );
}