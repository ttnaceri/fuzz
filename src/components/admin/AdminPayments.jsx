import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminPayments() {
  const [methods, setMethods] = useState([]);
  const [editMethod, setEditMethod] = useState(null);
  const [form, setForm] = useState({ name: '', logo_url: '', enabled: 0, discount: 0 });
  const { success, error: toastError } = useToast();

  const loadMethods = () => {
    api.get('/api/admin/payment-methods').then(data => setMethods(data.methods || [])).catch(() => {});
  };

  useEffect(() => { loadMethods(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/payment-methods', form);
      success("To'lov usuli qo'shildi!");
      loadMethods();
      setForm({ name: '', logo_url: '', enabled: 0, discount: 0 });
    } catch { toastError("Xato"); }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/api/admin/payment-methods/${editMethod.id}`, editMethod);
      success("Yangilandi!");
      setEditMethod(null);
      loadMethods();
    } catch { toastError("Xato"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/api/admin/payment-methods/${id}`);
      success("O'chirildi!"); loadMethods();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>To'lov Usullari</h1>

      {/* Yangi qo'shish formasi */}
      <form onSubmit={handleAdd} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nomi</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Logo URL</label>
          <input type="text" value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Chegirma (%)</label>
          <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Qo'shish</button>
      </form>

      {/* Ro'yxat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {methods.map(m => (
          <div key={m.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem', position: 'relative' }}>
            {m.discount > 0 && (
              <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                -{m.discount}%
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img src={m.logo_url} alt={m.name} style={{ height: '40px', objectFit: 'contain' }} onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0', textAlign: 'center' }}>{m.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: m.enabled ? '#43b581' : '#ed5555', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {m.enabled ? 'Faol' : 'Soon'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setEditMethod({...m})} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#f0b44d', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>Tahrirlash</button>
              <button onClick={() => handleDelete(m.id)} style={{ flex: 1, background: 'none', border: '1px solid #48201a', color: '#ed5555', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>O'chirish</button>
            </div>
          </div>
        ))}
      </div>

      {/* Tahrirlash modali */}
      {editMethod && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '400px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nomi</label>
              <input type="text" value={editMethod.name} onChange={e => setEditMethod({...editMethod, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Logo URL</label>
              <input type="text" value={editMethod.logo_url} onChange={e => setEditMethod({...editMethod, logo_url: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Chegirma (%)</label>
              <input type="number" value={editMethod.discount} onChange={e => setEditMethod({...editMethod, discount: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="enabled" checked={editMethod.enabled === 1} onChange={e => setEditMethod({...editMethod, enabled: e.target.checked ? 1 : 0})} style={{ accentColor: '#8a1200' }} />
              <label htmlFor="enabled" style={{ color: '#f5eeee', cursor: 'pointer' }}>Faol (enabled)</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleUpdate} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
              <button onClick={() => setEditMethod(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}