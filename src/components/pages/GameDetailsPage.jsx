import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/api/games/${id}`)
      .then(data => {
        if (data.game) {
          setGame(data.game);
        } else {
          setError("O'yin topilmadi");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("O'yin topilmadi yoki server xatosi");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Yuklanmoqda...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#ed5555', textAlign: 'center', marginTop: '20vh', padding: '2rem' }}>
        <h2>{error}</h2>
        <Link to="/store" style={{ color: '#8a1200', marginTop: '1rem', display: 'inline-block' }}>Do'konga qaytish</Link>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div style={{ padding: '2rem', color: '#f5eeee' }}>
      <Link to="/store" style={{ color: '#b9a6a2', marginBottom: '1rem', display: 'inline-block' }}>
        ← Do'konga qaytish
      </Link>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '2rem' }}>
        {game.image && (
          <img src={game.image} alt={game.title} style={{ width: '300px', borderRadius: '8px' }} />
        )}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ margin: '0 0 1rem 0' }}>{game.title}</h1>
          <p style={{ color: '#b9a6a2', marginBottom: '1rem' }}>{game.genre}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            {game.discount > 0 ? (
              <>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43b581' }}>${game.price - (game.price * game.discount / 100)}</span>
                <span style={{ textDecoration: 'line-through', color: '#b9a6a2' }}>${game.price}</span>
                <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>-{game.discount}%</span>
              </>
            ) : (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43b581' }}>${game.price}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to={`/game/${game.id}/play`} style={{ backgroundColor: '#8a1200', color: '#fff', padding: '0.8rem 2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              <i className="fa-solid fa-play"></i> O'ynash
            </Link>
            <button style={{ backgroundColor: '#43b581', color: '#fff', padding: '0.8rem 2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              <i className="fa-solid fa-cart-plus"></i> Savatga qo'shish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}