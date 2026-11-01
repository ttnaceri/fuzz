import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/admin/games');
      setGames(data.games || []);
    } catch (err) {
      toastError("O'yinlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham bu o'yinni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/api/admin/games/${id}`);
      success("O'yin o'chirildi");
      fetchGames(); // Ro'yxatni yangilash
    } catch (err) {
      toastError("O'chirishda xato");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f5eeee', margin: 0 }}>O'yinlar Boshqaruvi</h1>
        <Link to="/admin/new-game" style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Yangi O'yin Qo'shish
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Rasm</th>
            <th style={{ padding: '1rem' }}>O'yin Nomi</th>
            <th style={{ padding: '1rem' }}>Janr</th>
            <th style={{ padding: '1rem' }}>Narxi</th>
            <th style={{ padding: '1rem' }}>Holat</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#b9a6a2' }}>Yuklanmoqda...</td></tr>
          ) : games.length === 0 ? (
            <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#b9a6a2' }}>Hozircha o'yinlar yo'q.</td></tr>
          ) : (
            games.map((game) => (
              <tr key={game.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
                <td style={{ padding: '1rem' }}>
                  {game.image ? (
                    <img src={game.image} alt={game.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '60px', height: '40px', backgroundColor: '#100b0a', borderRadius: '4px' }}></div>
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{game.title}</td>
                <td style={{ padding: '1rem', color: '#b9a6a2' }}>{game.genre}</td>
                <td style={{ padding: '1rem', color: '#43b581', fontWeight: 'bold' }}>${game.price}</td>
                <td style={{ padding: '1rem' }}>
                  {game.available ? <span style={{ color: '#43b581' }}>Faol</span> : <span style={{ color: '#ed5555' }}>Nofaol</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleDelete(game.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer', marginRight: '10px' }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}