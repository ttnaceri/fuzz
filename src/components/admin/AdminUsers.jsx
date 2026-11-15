import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { error: toastError } = useToast();

  const loadUsers = () => {
    api.get('/api/admin/users')
      .then(data => setUsers(data.users || []))
      .catch(() => toastError("Foydalanuvchilarni yuklashda xato"));
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Foydalanuvchilar</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Avatar</th> {/* ID o'rniga Avatar */}
            <th style={{ padding: '1rem' }}>Username</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Telegram ID</th>
            <th style={{ padding: '1rem' }}>Role</th>
            <th style={{ padding: '1rem' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              
              {/* Avatar */}
              <td style={{ padding: '1rem' }}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #48201a' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#100b0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #48201a' }}>
                    <i className="fa-solid fa-user" style={{ color: '#48201a' }}></i>
                  </div>
                )}
              </td>

              <td style={{ padding: '1rem' }}>{u.username}</td>
              <td style={{ padding: '1rem' }}>{u.email}</td>
              <td style={{ padding: '1rem' }}>{u.telegram_id || '—'}</td>
              <td style={{ padding: '1rem', color: u.role === 'banned' ? '#ed5555' : (u.role === 'admin' ? '#43b581' : '#f5eeee') }}>{u.role}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${u.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}