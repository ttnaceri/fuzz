import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminAllGames() {
  const [games, setGames] = useState([]);
  const [discountInput, setDiscountInput] = useState({ id: null, value: '' });
  const { success, error: toastError } = useToast();

  const loadGames = () => {
    api.get('/api/admin/all-games').then(data => setGames(data.games || [])).catch(() => toastError("Yuklashda xato"));
  };

  useEffect(() => { loadGames(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("O'yinni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/api/admin/games/${id}`);
      success("O'chirildi"); loadGames();
    } catch { toastError("Xato"); }
  };

  const handleDiscount = async (id) => {
    const val = parseInt(discountInput.value);
    if (isNaN(val) || val < 10 || val > 95) return toastError("Chegirma 10% dan 95% gacha bo'lishi shart!");
    try {
      await api.put(`/api/admin/games/${id}/discount`, { discount: val });
      success("Chegirma saqlandi!");
      setDiscountInput({ id: null, value: '' });
      loadGames();
    } catch (err) { toastError(err.message || "Xato"); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Barcha O'yinlar</h1>
        <Link to="/admin/new-game" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Yangi Qo'shish
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Rasm</th>
            <th style={{ padding: '1rem' }}>Nomi</th>
            <th style={{ padding: '1rem' }}>Narxi</th>
            <th style={{ padding: '1rem' }}>Chegirma</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {games.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{g.image ? <img src={g.image} style={{width: 50, height: 30, objectFit:'cover', borderRadius: 4}}/> : 'Yo\'q'}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{g.title}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${g.price}</td>
              <td style={{ padding: '1rem' }}>
                {discountInput.id === g.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" min="10" max="95" placeholder="10-95" value={discountInput.value} onChange={(e) => setDiscountInput({ ...discountInput, value: e.target.value })} style={{ width: '60px', padding: '0.3rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff' }} />
                    <button onClick={() => handleDiscount(g.id)} style={{ background: '#43b581', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>OK</button>
                    <button onClick={() => setDiscountInput({ id: null, value: '' })} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>X</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: g.discount > 0 ? '#f0b44d' : '#b9a6a2' }}>{g.discount > 0 ? `${g.discount}%` : 'Yo\'q'}</span>
                    <button onClick={() => setDiscountInput({ id: g.id, value: g.discount || '' })} style={{ background: 'none', border: '1px solid #48201a', color: '#b9a6a2', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>O'zgartirish</button>
                  </div>
                )}
              </td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}