import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import GameCard from '../common/GameCard.jsx';
import Sidebar from '../common/Sidebar.jsx';

export default function WishlistPage() {
  const { user } = useAuth();
  const { info } = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.get(`/api/users/${user.id}/wishlist`)
      .then(data => {
        const list = data.games || [];
        setGames(list);
        
        // Chegirma bildirishnomalari
        const discounted = list.filter(g => g.discount > 0);
        if (discounted.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          discounted.forEach(g => {
            new Notification(`Chegirma! ${g.title}`, {
              body: `-${g.discount}% chegirma! Faqat $${(g.price - g.price * (g.discount / 100)).toFixed(2)}`,
              icon: g.image || '/image/logo.png'
            });
          });
        }
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, padding: '1.5rem' }}>
          <h1 className="page-title">Wishlist</h1>
          <div className="unavailable-notice">
            <Link to="/login">Tizimga kiring</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Wishlist</h1>
        
        {loading ? (
          <p style={{ color: '#b9a6a2' }}>Yuklanmoqda...</p>
        ) : error ? (
          <p style={{ color: '#ed5555' }}>{error}</p>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <i className="fa-solid fa-heart" style={{ fontSize: '3rem', color: '#48201a', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#f5eeee' }}>Wishlist bo'sh</h3>
            <Link to="/store" className="btn btn-primary mt-2">Do'konga o'tish</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {games.map(g => (
              <div key={g.id} style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
                {g.image && <img src={g.image} alt={g.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>{g.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {g.discount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#43b581', fontWeight: 'bold' }}>${(g.price - g.price * (g.discount / 100)).toFixed(2)}</span>
                        <span style={{ textDecoration: 'line-through', color: '#b9a6a2', fontSize: '0.8rem' }}>${g.price}</span>
                        <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>-{g.discount}%</span>
                      </div>
                    ) : (
                      <span style={{ color: '#43b581', fontWeight: 'bold' }}>${g.price}</span>
                    )}
                  </div>
                  <Link to={`/game/${g.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
                    Batafsil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}