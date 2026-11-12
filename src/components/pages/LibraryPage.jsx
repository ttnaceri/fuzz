import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatPrice } from '../../utils/formatters.js';

export default function LibraryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/api/users/${user.id}/library`)
      .then(data => setGames(data.games || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('library.title')}</h1>

        {loading && <Loading />}
        {!loading && games.length === 0 && (
          <EmptyState icon="fa-gamepad" title={t('library.empty')} message={t('library.emptySub')} />
        )}

        {!loading && games.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {games.map(game => (
              <Link key={game.id} to={`/game/${game.id}/play`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1rem' }}>
                  {game.image && <img src={game.image} alt={game.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                  <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem' }}>{game.title}</h3>
                  <p style={{ color: '#b9a6a2', fontSize: '0.85rem' }}>{formatPrice(game.price)}</p>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>{t('library.play')}</button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}