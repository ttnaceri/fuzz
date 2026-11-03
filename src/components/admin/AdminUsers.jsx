import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const { success, error: toastError } = useToast();

  const loadUsers = () => {
    api.get('/api/admin/users')
      .then(data => setUsers(data.users || []))
      .catch(() => toastError("Foydalanuvchilarni yuklashda xato"));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      success("Foydalanuvchi o'chirildi");
      loadUsers();
    } catch { toastError("Xato"); }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/admin/users/${editUser.id}`, {
        username: editUser.username,
        balance: editUser.balance,
        role: editUser.role
      });
      success("Saqlandi");
      setEditUser(null);
      loadUsers();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Foydalanuvchilar</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Username</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Telegram ID</th>
            <th style={{ padding: '1rem' }}>Role</th>
            <th style={{ padding: '1rem' }}>Balance</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{u.username}</td>
              <td style={{ padding: '1rem' }}>{u.email}</td>
              <td style={{ padding: '1rem' }}>{u.telegram_id || '—'}</td>
              <td style={{ padding: '1rem' }}>{u.role}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${u.balance}</td>
              <td style={{ padding: '1rem', color: u.role === 'admin' ? '#43b581' : '#b9a6a2' }}>{u.role === 'admin' ? 'Admin' : 'User'}</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleEdit(u)} style={{ background: 'none', border: 'none', color: '#f0b44d', cursor: 'pointer', marginRight: '0.5rem' }}><i className="fa-solid fa-pen"></i></button>
                <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '400px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Foydalanuvchini Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Username</label>
              <input type="text" value={editUser.username} onChange={e => setEditUser({ ...editUser, username: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Balance ($)</label>
              <input type="number" value={editUser.balance} onChange={e => setEditUser({ ...editUser, balance: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Role</label>
              <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}