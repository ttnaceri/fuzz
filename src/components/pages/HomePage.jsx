import { Link } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { useCart } from '../context/useCart.js';
import { useSound } from '../hooks/useSound.js';

export default function HomePage() {
  const { games, loading, error, reload } = useGames();
  const { addItem } = useCart();
  const { playNotification } = useSound();

  const handleAdd = (game) => {
    addItem(game);
    playNotification();
  };

  return (
    <div className="page">
      <section className="hero" style={{ background: 'linear-gradient(135deg, #8a1200 0%, #3d0500 100%)' }}>
        <div className="hero__content">
          <h1>Welcome to Fuzz</h1>
          <p>Discover PC games, manage your library, and join the community.</p>
          <Link to="/store" className="btn btn-primary">Browse Store</Link>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Featured Games</h2>
          <Link to="/store" className="text-muted">View all →</Link>
        </div>
        {loading && <Loading label="Loading games…" />}
        {error && !loading && (
          <ErrorState
            title="Could not load games"
            message={error.message}
            onRetry={reload}
          />
        )}
        {!loading && !error && (
          <GameGrid games={games} onAddToCart={handleAdd} emptyMessage="Hozircha o'yinlar yo'q." />
        )}
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Quick links</h2>
        </div>
        <div className="game-grid">
          {[
            { to: '/new-releases', icon: 'fa-star', label: 'New Releases' },
            { to: '/special-offers', icon: 'fa-tags', label: 'Special Offers' },
            { to: '/free-games', icon: 'fa-gift', label: 'Free Games' },
            { to: '/top-sellers', icon: 'fa-trophy', label: 'Top Sellers' },
            { to: '/categories', icon: 'fa-layer-group', label: 'Categories' },
            { to: '/community', icon: 'fa-users', label: 'Community' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <i className={`fa-solid ${l.icon}`} style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }} />
              <div style={{ fontWeight: 700 }}>{l.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}