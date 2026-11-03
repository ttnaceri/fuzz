import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

const PERMISSIONS = [
  { key: 'view_dashboard', label: 'Dashboard ko\'rish' },
  { key: 'manage_users', label: 'Foydalanuvchilarni boshqarish' },
  { key: 'manage_games', label: 'O\'yinlarni boshqarish' },
  { key: 'manage_companies', label: 'Kompaniyalarni boshqarish' },
  { key: 'manage_bundles', label: 'Bundle\'larni boshqarish' },
  { key: 'manage_events', label: 'Eventlarni boshqarish' },
  { key: 'manage_rates', label: 'Valyuta kurslarini boshqarish' },
  { key: 'manage_api', label: 'API Keys boshqarish' },
  { key: 'manage_webhooks', label: 'Webhooks boshqarish' },
  { key: 'manage_backend', label: 'Backend xizmatlarini boshqarish' },
  { key: 'manage_roles', label: 'Rollarni boshqarish' },
];

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] });
  const { success, error: toastError } = useToast();

  const load = () => api.get('/api/admin/roles').then(d => setRoles(d.roles || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toastError("Rol nomini kiriting!");
    try {
      await api.post('/api/admin/roles', form);
      success("Rol yaratildi!"); load(); setForm({ name: '', description: '', permissions: [] });
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Rollar</h1>
      
      <form onSubmit={handleCreate} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Rol Nomi</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Tavsif</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Ruxsatlar (Toogle On/Off)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
            {PERMISSIONS.map(p => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f5eeee', cursor: 'pointer', backgroundColor: '#100b0a', padding: '0.5rem', borderRadius: '4px' }}>
                <input 
                  type="checkbox" 
                  checked={form.permissions.includes(p.key)}
                  onChange={() => togglePermission(p.key)}
                  style={{ accentColor: '#8a1200' }}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Rol Yaratish</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {roles.map(r => (
          <div key={r.id} style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{r.name}</h3>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{r.description}</p>
            <div style={{ color: '#f0b44d', fontSize: '0.75rem' }}>
              Ruxsatlar: {JSON.parse(r.permissions || '[]').length} ta
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}