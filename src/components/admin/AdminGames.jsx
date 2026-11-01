import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminNewGame() {
  const [form, setForm] = useState({ title: '', price: '', genre: 'Web Game', image: '', game_url: '' });
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.game_url) return toastError("Nom, Narx va URL ni kiriting!");

    setLoading(true);
    try {
      await api.post('/api/admin/games', form);
      success("Web o'yin muvaffaqiyatli qo'shildi!");
      navigate('/admin/games');
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
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Masalan: Ravenfield Web" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Narxi ($) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="0.00" step="0.01" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Janri</label>
            <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}>
              <option value="Web Game">Web Game</option>
              <option value="3D Shooter">3D Shooter</option>
              <option value="2D Platformer">2D Platformer</option>
              <option value="WebGL">WebGL</option>
            </select>
          </div>
        </div>

        {/* Eng muhim qism: O'yin URL manzili */}
        <div style={{ marginBottom: '1rem', backgroundColor: 'rgba(67, 181, 129, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid #43b581' }}>
          <label style={{ display: 'block', color: '#43b581', marginBottom: '0.5rem', fontWeight: 'bold' }}>O'yin Linki (GitHub / Vercel) *</label>
          <input type="url" value={form.game_url} onChange={e => setForm({ ...form, game_url: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="https://my-web-game.vercel.app" />
          <small style={{ color: '#b9a6a2', display: 'block', marginTop: '0.3rem' }}>Foydalanuvchi sotib olgach, o'yin shu havolada ochiladi.</small>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Rasm URL manzili (Cover)</label>
          <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="/image/games/default.jpg" />
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          {loading ? 'Saqlanmoqda...' : 'O\'yinni Saqlash'}
        </button>
      </form>
    </div>
  );
}