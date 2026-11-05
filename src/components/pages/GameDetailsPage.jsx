import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/games/${id}`),
      user ? api.get(`/api/users/${user.id}/owns/${id}`) : Promise.resolve({ owned: false })
    ])
      .then(([gameData, ownsData]) => {
        if (gameData.game) {
          setGame(gameData.game);
          setOwned(ownsData.owned);
        } else {
          setError("O'yin topilmadi");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("O'yin topilmadi yoki server xatosi");
        setLoading(false);
      });
  }, [id, user]);

  const handlePurchase = async () => {
    if (!user) {
      toastError("Sotib olish uchun tizimga kiring!");
      navigate('/login');
      return;
    }

    try {
      await api.post('/api/store/buy', { userId: user.id, gameId: game.id });
      success("O'yin sotib olindi!");
      setOwned(true);
    } catch (err) {
      toastError(err.message || "Sotib olishda xato");
    }
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Yuklanmoqda...</div>;
  if (error) return (
    <div style={{ color: '#ed5555', textAlign: 'center', marginTop: '20vh' }}>
      <h2>{error}</h2>
      <Link to="/store" style={{ color: '#8a1200', marginTop: '1rem', display: 'inline-block' }}>Do'konga qaytish</Link>
    </div>
  );
  if (!game) return null;

  const finalPrice = game.discount > 0 
    ? game.price - (game.price * (game.discount / 100)) 
    : game.price;

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
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43b581' }}>${finalPrice.toFixed(2)}</span>
                <span style={{ textDecoration: 'line-through', color: '#b9a6a2' }}>${game.price}</span>
                <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>-{game.discount}%</span>
              </>
            ) : (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43b581' }}>${game.price}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {owned ? (
              <Link to={`/game/${game.id}/play`} className="btn btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none', fontWeight: 'bold' }}>
                <i className="fa-solid fa-play"></i> O'ynash
              </Link>
            ) : (
              <>
                <button onClick={handlePurchase} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>
                  <i className="fa-solid fa-shopping-cart"></i> Sotib olish
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/store')}
                  style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}
                >
                  Orqaga
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}