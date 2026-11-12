import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { useLanguage } from '../context/useLanguage.js';
import { api } from '../services/api.js';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!username.trim() || username.trim().length < 3) {
      return toastError(t('profile.minLength'));
    }
    if (username.trim() === user.username) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}/username`, { username: username.trim() });
      success(t('profile.success'));
      if (refreshUser) await refreshUser();
      setEditing(false);
    } catch (err) {
      toastError(err.message || t('profile.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setEditing(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#f5eeee', margin: 0, fontSize: '1.2rem' }}>
            <i className="fa-solid fa-user"></i> {t('profile.accountInfo')}
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              {t('profile.username')}
            </label>

            {!editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong style={{ color: '#f5eeee', fontSize: '1.1rem' }}>
                  {user?.username || '—'}
                </strong>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #48201a',
                    color: '#b9a6a2',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  <i className="fa-solid fa-pen"></i> {t('profile.editUsername')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('profile.username')}
                  autoFocus
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !username.trim() || username.trim().length < 3}
                >
                  {loading ? t('profile.saving') : t('common.save')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
              </form>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              {t('profile.email')}
            </label>
            <strong style={{ color: '#f5eeee' }}>{user?.email || '—'}</strong>
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              {t('profile.role')}
            </label>
            <strong style={{ color: '#f5eeee' }}>{user?.role || 'user'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}