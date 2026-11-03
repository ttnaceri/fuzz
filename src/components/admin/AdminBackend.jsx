import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminBackend() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const { success, error: toastError } = useToast();

  const load = () => api.get('/api/admin/backend').then(d => setServices(d.services || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/backend', form);
      success("Xizmat qo'shildi!"); load(); setForm({ name: '', url: '' });
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Backend Services</h1>
      
      <form onSubmit={handleAdd} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Xizmat Nomi</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>URL</label>
          <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Qo'shish</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Xizmat</th>
            <th style={{ padding: '1rem' }}>URL</th>
            <th style={{ padding: '1rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{s.name}</td>
              <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{s.url}</td>
              <td style={{ padding: '1rem', color: s.status === 'active' ? '#43b581' : '#ed5555' }}>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}