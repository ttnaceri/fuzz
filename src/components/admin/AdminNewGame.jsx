import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminNewGame() {
  const [form, setForm] = useState({ title: '', price: '', genre: 'Action', image: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return toastError("Nom va Narxni kiriting!");

    setLoading(true);
    try {
      await api.post('/api/admin/games', form);
      success("O'yin muvaffaqiyatli qo'shildi!");
      navigate('/admin/games'); // Ro'yxatga qaytish
    } catch (err) {
      toastError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Yangi O'yin Qo'shish</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>O'yin Nomi *</label>
          <input 
            type="text" 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            placeholder="Masalan: Call of Duty: Modern Warfare 2"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Narxi ($) *</label>
          <input 
            type="number" 
            value={form.price} 
            onChange={e => setForm({ ...form, price: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Janri</label>
          <select 
            value={form.genre} 
            onChange={e => setForm({ ...form, genre: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value="Action">Action</option>
            <option value="FPS">FPS</option>
            <option value="RPG">RPG</option>
            <option value="Strategy">Strategy</option>
            <option value="Survival">Survival</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Rasm URL manzili</label>
          <input 
            type="text" 
            value={form.image} 
            onChange={e => setForm({ ...form, image: e.target.value })}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
            placeholder="/image/games/default.jpg yoki https://..."
          />
          <small style={{ color: '#b9a6a2', display: 'block', marginTop: '0.3rem' }}>Agar bo'sh qoldirsangiz, rasm ko'rinmaydi.</small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
        >
          {loading ? 'Saqlanmoqda...' : 'O\'yinni Saqlash'}
        </button>
      </form>
    </div>
  );
}