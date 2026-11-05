import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import Sidebar from '../common/Sidebar.jsx';

export default function EditProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email, password: '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}`, {
        username: form.username,
        email: form.email,
        password: form.password || undefined
      });
      success("Profil yangilandi!");
    } catch (err) {
      toastError(err.message || "Xato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Edit Profile</h1>
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Yangi parol (ixtiyoriy)</label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Bo'sh qoldirsangiz o'zgarmaydi" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}