import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminApi() {
  const [keys, setKeys] = useState([]);
  const [form, setForm] = useState({ description: '', permissions: '', expires_at: '' });
  const { success, error: toastError } = useToast();

  const loadKeys = () => {
    api.get('/api/admin/api-keys').then(data => setKeys(data.keys || [])).catch(() => {});
  };

  useEffect(() => { loadKeys(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/api-keys', form);
      success(`API Key yaratildi: ${res.key}`);
      loadKeys();
      setForm({ description: '', permissions: '', expires_at: '' });
    } catch { toastError("Xato"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/api/admin/api-keys/${id}`);
      success("O'chirildi"); loadKeys();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>API Keys</h1>
      
      <form onSubmit={handleCreate} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Tavsif</label>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Ruxsatlar</label>
          <input type="text" value={form.permissions} onChange={e => setForm({ ...form, permissions: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yaratish</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Key (Yashirin)</th>
            <th style={{ padding: '1rem' }}>Tavsif</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{k.key_value.substring(0, 12)}...</td>
              <td style={{ padding: '1rem' }}>{k.description}</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleDelete(k.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}