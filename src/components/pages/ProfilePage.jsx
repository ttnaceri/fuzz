import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { api } from '../services/api.js';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

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
      return toastError("Username kamida 3 belgidan iborat bo'lishi kerak!");
    }
    if (username.trim() === user.username) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}/username`, { username: username.trim() });
      success("Username muvaffaqiyatli yangilandi!");
      if (refreshUser) await refreshUser();
      setEditing(false);
    } catch (err) {
      toastError(err.message || "Xato yuz berdi");
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
      <h1 className="page-title">Profile</h1>

      {/* Asosiy ma'lumotlar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#f5eeee', margin: 0, fontSize: '1.2rem' }}>
            <i className="fa-solid fa-user"></i> Hisob ma'lumotlari
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Username (editable) */}
          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Username
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
                  <i className="fa-solid fa-pen"></i> O'zgartirish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Yangi username"
                  autoFocus
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !username.trim() || username.trim().length < 3}
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Bekor qilish
                </button>
              </form>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Email
            </label>
            <strong style={{ color: '#f5eeee' }}>{user?.email || '—'}</strong>
          </div>

          {/* Role (read-only) */}
          <div>
            <label style={{ display: 'block', color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Role
            </label>
            <strong style={{ color: '#f5eeee' }}>{user?.role || 'user'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}