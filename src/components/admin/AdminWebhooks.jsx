import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [form, setForm] = useState({ name: '', url: '', event_type: 'all', secret: '' });
  const { success, error: toastError } = useToast();

  const loadWebhooks = () => {
    api.get('/api/admin/webhooks').then(data => setWebhooks(data.webhooks || [])).catch(() => {});
  };

  useEffect(() => { loadWebhooks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.url) return toastError("Nom va URL ni kiriting!");
    try {
      await api.post('/api/admin/webhooks', form);
      success("Webhook yaratildi!");
      loadWebhooks();
      setForm({ name: '', url: '', event_type: 'all', secret: '' });
    } catch { toastError("Xato"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try { await api.delete(`/api/admin/webhooks/${id}`); success("O'chirildi"); loadWebhooks(); } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Webhooks</h1>
      
      <form onSubmit={handleCreate} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nomi</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>URL</label>
          <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yaratish</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Nomi</th>
            <th style={{ padding: '1rem' }}>URL</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map(w => (
            <tr key={w.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{w.name}</td>
              <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#b9a6a2' }}>{w.url}</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleDelete(w.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}