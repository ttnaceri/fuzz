import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { wishlistService } from '../services/wishlistService.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import GameGrid from '../common/GameGrid.jsx';

export default function WishlistPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    wishlistService.list()
      .then((r) => setGames(r?.games || r || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Wishlist</h1>
        {!api.isConfigured() && (
          <div className="unavailable-notice">
            <i className="fa-solid fa-info-circle" /> Backend not configured — wishlist unavailable.
          </div>
        )}
        {loading && api.isConfigured() && <Loading />}
        {error && <p className="text-muted">{error.message}</p>}
        {!loading && games.length === 0 && api.isConfigured() && (
          <EmptyState icon="fa-heart" title="Wishlist empty" />
        )}
        {games.length > 0 && <GameGrid games={games} />}
      </div>
    </div>
  );
}