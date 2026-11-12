import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatPrice } from '../../utils/formatters.js';

export default function WishlistPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    if (!user?.id) return;
    api.get(`/api/users/${user.id}/wishlist`)
      .then(data => setGames(data.games || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWishlist(); }, [user]);

  const remove = async (gameId) => {
    try {
      await api.delete(`/api/wishlist/${user.id}/${gameId}`);
      loadWishlist();
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('wishlist.title')}</h1>

        {loading && <Loading />}
        {!loading && games.length === 0 && (
          <EmptyState icon="fa-heart" title={t('wishlist.empty')} message={t('wishlist.emptySub')} />
        )}

        {!loading && games.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {games.map(game => (
              <div key={game.id} className="card" style={{ padding: '1rem' }}>
                <Link to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
                  {game.image && <img src={game.image} alt={game.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                  <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem' }}>{game.title}</h3>
                </Link>
                <p style={{ color: '#43b581', fontWeight: 'bold' }}>{formatPrice(game.price)}</p>
                <button onClick={() => remove(game.id)} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <i className="fa-solid fa-trash"></i> {t('wishlist.remove')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}