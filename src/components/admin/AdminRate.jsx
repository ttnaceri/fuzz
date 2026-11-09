import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminRate() {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({ currency: 'USD', rate: '', source: 'manual' });
  const { success, error: toastError } = useToast();

  const loadRates = () => {
    api.get('/api/admin/rates').then(data => setRates(data.rates || [])).catch(() => {});
  };

  useEffect(() => { loadRates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rate) return toastError("Kursni kiriting!");
    try {
      await api.post('/api/admin/rates', form);
      success("Kurs saqlandi!");
      setForm({ ...form, rate: '' });
      loadRates();
    } catch { toastError("Xato"); }
  };

  const handleFetchApi = async () => {
    try {
      const res = await fetch('https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD');
      const data = await res.json();
      if (data.conversion_rates.UZS) {
        setForm({ ...form, rate: data.conversion_rates.UZS.toString(), source: 'api' });
        success("API dan kurs olindi!");
      }
    } catch { toastError("API xatosi"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Valyuta Kurslari</h1>
      
      <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Yangi Kurs Qo'shish</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Valyuta</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UZS">UZS</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ color: '#b9a6a2', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Kurs</label>
            <input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
          </div>
          <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
          <button type="button" onClick={handleFetchApi} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>API dan olish</button>
        </form>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Valyuta</th>
            <th style={{ padding: '1rem' }}>Kurs</th>
            <th style={{ padding: '1rem' }}>Manba</th>
          </tr>
        </thead>
        <tbody>
          {rates.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{r.currency}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>{r.rate}</td>
              <td style={{ padding: '1rem' }}>{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}