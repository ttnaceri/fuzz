import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import Sidebar from '../common/Sidebar.jsx';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim() || username.trim().length < 3) {
      toastError("Username kamida 3 belgidan iborat bo'lishi kerak!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/api/users/${user.id}/username`, {
        username: username.trim()
      });
      
      success("Username muvaffaqiyatli yangilandi!");
      
      if (refreshUser) {
        await refreshUser();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toastError(err.message || "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, padding: '1.5rem' }}>
          <h1 className="page-title">Edit Profile</h1>
          <div className="unavailable-notice">Tizimga kiring.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Fuzz'dagi ismingiz"
              required
            />
            <small style={{ color: '#b9a6a2', fontSize: '0.75rem', display: 'block', marginTop: '0.3rem' }}>
              Bu Fuzz'dagi ko'rinadigan ismingiz.
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || username === user.username}
          >
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}