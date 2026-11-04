import { useState } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminEditUser() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', telegram_id: '', balance: '', role: '' });
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
      setUsers(res.users || []);
      if (res.users?.length === 1) {
        handleSelect(res.users[0]);
      }
    } catch (err) {
      toastError("Qidiruvda xato");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      email: user.email,
      telegram_id: user.telegram_id || '',
      balance: user.balance.toString(),
      role: user.role
    });
    setUsers([]); // Natijalarni yopish
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/api/admin/users/${selectedUser.id}`, form);
      success("Foydalanuvchi ma'lumotlari yangilandi!");
      setSelectedUser(null);
      setQuery('');
    } catch (err) {
      toastError(err.message || "Xato");
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Foydalanuvchini Tahrirlash</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Username, Email yoki Telegram ID orqali qidirish..."
          style={{ flex: 1, padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Qidirilmoqda...' : 'Qidirish'}
        </button>
      </form>

      {users.length > 0 && !selectedUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#b9a6a2', fontSize: '0.9rem' }}>Natijalar:</h3>
          {users.map(u => (
            <div key={u.id} onClick={() => handleSelect(u)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', cursor: 'pointer' }}>
              <div>
                <div style={{ color: '#f5eeee', fontWeight: 'bold' }}>{u.username}</div>
                <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>{u.email} | TG: {u.telegram_id || '—'}</div>
              </div>
              <div style={{ color: '#43b581', fontWeight: 'bold' }}>${u.balance}</div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Tahrirlash: {selectedUser.username}</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Username</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Telegram ID</label>
            <input type="text" value={form.telegram_id} onChange={e => setForm({ ...form, telegram_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            <small style={{ color: '#ed5555', display: 'block', marginTop: '0.3rem' }}>Diqqat: Telegram ID ni o'zgartirsangiz, Stars to'lovlari noto'g'ri ishlashi mumkin.</small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Balance ($)</label>
              <input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
            <button onClick={() => setSelectedUser(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
          </div>
        </div>
      )}
    </div>
  );
}