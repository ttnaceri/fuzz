import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminAllGames() {
  const [games, setGames] = useState([]);
  const [editGame, setEditGame] = useState(null);
  const [bundles, setBundles] = useState([]);
  const { success, error: toastError } = useToast();

  const loadGames = () => {
    api.get('/api/admin/all-games').then(data => setGames(data.games || [])).catch(() => toastError("Yuklashda xato"));
  };

  const loadBundles = () => {
    api.get('/api/admin/bundles').then(data => setBundles(data.bundles || [])).catch(() => {});
  };

  useEffect(() => { loadGames(); loadBundles(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("O'yinni o'chirishni tasdiqlaysizmi?")) return;
    try { await api.delete(`/api/admin/games/${id}`); success("O'chirildi"); loadGames(); } catch { toastError("Xato"); }
  };

  const handleEdit = (game) => setEditGame({ ...game });

  const handleSave = async () => {
    try {
      await api.put(`/api/admin/games/${editGame.id}`, {
        title: editGame.title,
        price: editGame.price,
        genre: editGame.genre,
        image: editGame.image,
        game_url: editGame.game_url,
        discount: editGame.discount
      });
      success("Saqlandi"); setEditGame(null); loadGames();
    } catch { toastError("Xato"); }
  };

  const handleAddToBundle = async (gameId, bundleId) => {
    try {
      await api.post(`/api/admin/bundles/${bundleId}/games`, { gameId });
      success("O'yin bundlega qo'shildi!");
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>Barcha O'yinlar</h1>
        <Link to="/admin/new-game" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>+ Yangi Qo'shish</Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Rasm</th>
            <th style={{ padding: '1rem' }}>Nomi</th>
            <th style={{ padding: '1rem' }}>Narxi</th>
            <th style={{ padding: '1rem' }}>Chegirma</th>
            <th style={{ padding: '1rem' }}>Bundle</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {games.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>{g.image ? <img src={g.image} style={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 4 }} /> : 'Yo\'q'}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{g.title}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>${g.price}</td>
              <td style={{ padding: '1rem', color: '#f0b44d' }}>{g.discount > 0 ? `${g.discount}%` : '—'}</td>
              <td style={{ padding: '1rem' }}>
                <select onChange={(e) => handleAddToBundle(g.id, e.target.value)} defaultValue="" style={{ padding: '0.3rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }}>
                  <option value="" disabled>Bundlega qo'shish</option>
                  {bundles.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => handleEdit(g)} style={{ background: 'none', border: 'none', color: '#f0b44d', cursor: 'pointer', marginRight: '0.5rem' }}><i className="fa-solid fa-pen"></i></button>
                <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editGame && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '500px' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>O'yinni Tahrirlash</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Nomi</label>
              <input type="text" value={editGame.title} onChange={e => setEditGame({ ...editGame, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Narxi ($)</label>
                <input type="number" value={editGame.price} onChange={e => setEditGame({ ...editGame, price: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Chegirma (%)</label>
                <input type="number" value={editGame.discount} onChange={e => setEditGame({ ...editGame, discount: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>O'yin URL</label>
              <input type="url" value={editGame.game_url} onChange={e => setEditGame({ ...editGame, game_url: e.target.value })} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Saqlash</button>
              <button onClick={() => setEditGame(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}