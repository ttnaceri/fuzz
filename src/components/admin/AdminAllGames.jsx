import { useState, useEffect } from 'react'; // IMPORT QILINDI
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminAllGames() {
  const [games, setGames] = useState([]);
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
            <th style={{ padding: '1rem' }}>O'yin ID</th>
            <th style={{ padding: '1rem' }}>Nomi</th>
            <th style={{ padding: '1rem' }}>Narxi</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {games.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{g.image ? <img src={g.image} style={{width: 50, height: 30, objectFit:'cover', borderRadius: 4}}/> : 'Yo\'q'}</td>
              <td style={{ padding: '1rem', color: '#b9a6a2', fontSize: '0.8rem' }}>{g.id}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{g.title}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${g.price}</td>
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