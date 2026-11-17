import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';
import { useLanguage } from '../context/useLanguage.js';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();
  const { t } = useLanguage();

  const loadUsers = () => {
    setLoading(true);
    api.get('/api/admin/users')
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => { toastError("Foydalanuvchilarni yuklashda xato"); setLoading(false); });
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>{t('admin.users') || 'Foydalanuvchilar'}</h1>
      
      {loading ? <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p> : (
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#19100e', color: '#b9a6a2' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Username</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Telegram ID</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Balance</th>
                <th style={{ padding: '1rem' }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #48201a', color: '#f5eeee' }}>
                  <td style={{ padding: '1rem' }}>{u.username}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>{u.telegram_id || '—'}</td>
                  <td style={{ padding: '1rem', color: u.role === 'banned' ? '#ed5555' : (u.role === 'admin' ? '#43b581' : '#f5eeee') }}>{u.role}</td>
                  <td style={{ padding: '1rem', color: '#43b581' }}>${u.balance}</td>
                  <td style={{ padding: '1rem' }}>
                    <Link to="/admin/edit-user" style={{ color: '#f0b44d', textDecoration: 'none' }}>
                      <i className="fa-solid fa-pen"></i> Tahrirlash
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}