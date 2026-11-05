import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminNewBundle() {
  const [form, setForm] = useState({ name: '', description: '', image: '', price: '', discount: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toastError("Nom va Narxni kiriting!");
    setLoading(true);
    try {
      await api.post('/api/admin/bundles', form);
      success("Bundle yaratildi!");
      navigate('/admin/bundles');
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Yangi Bundle Yaratish</h1>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Bundle Nomi *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Narxi ($) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Chegirma (%)</label>
            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Tavsif</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}></textarea>
        </div>

        {/* Rasm o'rniga CDNJS icon komponenti */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#19100e', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #48201a', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', margin: '0 auto', borderRadius: '8px', 
            backgroundColor: '#241411', border: '1px solid #48201a',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', color: '#8a1200' }}></i>
          </div>
          <div style={{ color: '#b9a6a2', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Bundle uchun rasm shart emas. Icon avtomatik ishlatiladi.
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          {loading ? 'Saqlanmoqda...' : 'Bundle Yaratish'}
        </button>
      </form>
    </div>
  );
}