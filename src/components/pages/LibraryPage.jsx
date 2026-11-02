import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';

export default function LibraryPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    
    api.get(`/api/users/${user.id}/library`)
      .then(data => { setGames(data.games || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Yuklanmoqda...</div>;

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1 className="page-title" style={{ color: '#f5eeee' }}>Mening Kutubxonam</h1>
      
      {games.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#48201a', marginBottom: '1rem' }}></i>
          <h3 style={{ color: '#f5eeee' }}>Sizda hali o'yinlar yo'q</h3>
          <Link to="/store" className="btn btn-primary mt-2">Do'konga o'tish</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {games.map(game => (
            <div key={game.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
              {game.image && <img src={game.image} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#f5eeee', margin: '0 0 1rem 0' }}>{game.title}</h3>
                <Link to={`/game/${game.id}/play`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#8a1200', color: '#fff', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                  <i className="fa-solid fa-play"></i> O'ynash
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}