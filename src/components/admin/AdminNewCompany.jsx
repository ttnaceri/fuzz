import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';
import ImageUploader from '../common/ImageUploader.jsx';

export default function AdminNewCompany() {
  const [form, setForm] = useState({ name: '', logo: '', website: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toastError("Kompaniya nomini kiriting!");

    setLoading(true);
    try {
      await api.post('/api/admin/companies', form);
      success("Kompaniya muvaffaqiyatli qo'shildi!");
      navigate('/admin/companies');
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Yangi Kompaniya Qo'shish</h1>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Kompaniya Nomi *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>

        {/* Logotip yuklash */}
        <div style={{ marginBottom: '1rem', backgroundColor: '#19100e', padding: '1rem', borderRadius: '4px', border: '1px dashed #48201a' }}>
          <ImageUploader 
            label="Kompaniya Logotipi"
            value={form.logo} 
            onChange={(url) => setForm({ ...form, logo: url })} 
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Veb-sayt</label>
          <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Tavsif</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}></textarea>
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          {loading ? 'Saqlanmoqda...' : 'Kompaniyani Saqlash'}
        </button>
      </form>
    </div>
  );
}