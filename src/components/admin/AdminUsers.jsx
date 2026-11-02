import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
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

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { role: newRole });
      success("Rol o'zgartirildi");
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
            <th style={{ padding: '1rem' }}>Role</th>
            <th style={{ padding: '1rem' }}>Balance</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{u.username}</td>
              <td style={{ padding: '1rem' }}>{u.email}</td>
              <td style={{ padding: '1rem' }}>
                <select 
                  value={u.role} 
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  style={{ backgroundColor: '#100b0a', color: '#fff', border: '1px solid #48201a', padding: '0.2rem', borderRadius: '4px' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="banned">Banned</option>
                </select>
              </td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${u.balance}</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}