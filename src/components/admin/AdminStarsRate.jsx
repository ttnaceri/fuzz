import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminStarsRate() {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({ amount_usd: '', stars_amount: '' });
  const { success, error: toastError } = useToast();

  const loadRates = () => {
    api.get('/api/admin/stars-rates').then(data => setRates(data.rates || [])).catch(() => {});
  };

  useEffect(() => { loadRates(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount_usd || !form.stars_amount) return toastError("Barcha maydonlarni to'ldiring!");
    try {
      await api.post('/api/admin/stars-rates', form);
      success("Kurs qo'shildi!");
      setForm({ amount_usd: '', stars_amount: '' });
      loadRates();
    } catch { toastError("Xato"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/api/admin/stars-rates/${id}`);
      success("O'chirildi"); loadRates();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Telegram Stars Kurslari</h1>
      
      <form onSubmit={handleCreate} style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Fuzz Balans ($)</label>
          <input type="number" step="0.01" value={form.amount_usd} onChange={e => setForm({ ...form, amount_usd: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} placeholder="1" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Stars Miqdori</label>
          <input type="number" value={form.stars_amount} onChange={e => setForm({ ...form, stars_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} placeholder="10" />
        </div>
        <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kurs Qo'shish</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Fuzz Balans ($)</th>
            <th style={{ padding: '1rem' }}>Stars Miqdori</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {rates.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem', color: '#43b581' }}>${r.amount_usd}</td>
              <td style={{ padding: '1rem', color: '#f0b44d' }}>{r.stars_amount} Stars</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}