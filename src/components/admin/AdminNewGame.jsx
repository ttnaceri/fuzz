import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';
import ImageUploader from '../common/ImageUploader.jsx';

export default function AdminNewGame() {
  const [form, setForm] = useState({ title: '', price: '', genre: '', image: '', game_url: '', company_id: '' });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/admin/companies')
      .then(data => setCompanies(data.companies || []))
      .catch(() => toastError("Kompaniyalarni yuklashda xato"));
  }, [toastError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.game_url || !form.company_id) {
      return toastError("Barcha majburiy maydonlarni to'ldiring!");
    }

    setLoading(true);
    try {
      await api.post('/api/admin/games', form);
      success("O'yin muvaffaqiyatli qo'shildi!");
      navigate('/admin/all-games');
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Yangi Web O'yin Qo'shish</h1>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '700px' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>O'yin Nomi *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Narxi ($) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} step="0.01" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Janrlar</label>
            <input type="text" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Kompaniya *</label>
          <select value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}>
            <option value="">Kompaniyani tanlang</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>O'yin Linki (GitHub / Vercel) *</label>
          <input type="url" value={form.game_url} onChange={e => setForm({ ...form, game_url: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>

        {/* Yangilangan Rasm qismi */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#19100e', padding: '1rem', borderRadius: '4px', border: '1px dashed #48201a' }}>
          <ImageUploader 
            label="O'yin Cover Rasmi"
            value={form.image} 
            onChange={(url) => setForm({ ...form, image: url })} 
          />
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          {loading ? 'Saqlanmoqda...' : 'O\'yinni Saqlash'}
        </button>
      </form>
    </div>
  );
}