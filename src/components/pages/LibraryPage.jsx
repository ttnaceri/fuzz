import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { libraryService } from '../services/libraryService.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import GameGrid from '../common/GameGrid.jsx';

export default function LibraryPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) {
      setLoading(false);
      return;
    }
    libraryService
      .list()
      .then((r) => setGames(r?.games || r || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Library</h1>
        {!api.isConfigured() && (
          <div className="unavailable-notice">
            <i className="fa-solid fa-info-circle" /> Backend not configured — library unavailable.
          </div>
        )}
        {loading && api.isConfigured() && <Loading />}
        {error && <p className="text-muted">{error.message}</p>}
        {!loading && !error && games.length === 0 && (
          <EmptyState icon="fa-book" title="Library empty" message="Purchase games to see them here." />
        )}
        {games.length > 0 && <GameGrid games={games} />}
      </div>
    </div>
  );
}