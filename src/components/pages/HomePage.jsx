import { Link } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';

export default function HomePage() {
  const { games, loading, error, reload } = useGames();
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__content">
          <h1>{t('home.welcome')}</h1>
          <p>{t('home.subtitle')}</p>
          <Link to="/store" className="btn btn-primary">{t('home.browseBtn')}</Link>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{t('home.featured')}</h2>
          <Link to="/store" className="text-muted">{t('home.viewAll')} →</Link>
        </div>
        {loading && <Loading />}
        {error && !loading && <ErrorState message={error.message} onRetry={reload} />}
        {!loading && !error && (
          <GameGrid games={games} onAddToCart={addItem} emptyMessage={t('home.noGames')} />
        )}
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{t('home.quickLinks')}</h2>
        </div>
        <div className="game-grid">
          {[
            { to: '/new-releases', icon: 'fa-star', label: t('home.newReleases') },
            { to: '/special-offers', icon: 'fa-tags', label: t('home.specialOffers') },
            { to: '/free-games', icon: 'fa-gift', label: t('home.freeGames') },
            { to: '/top-sellers', icon: 'fa-trophy', label: t('home.topSellers') },
            { to: '/categories', icon: 'fa-layer-group', label: t('home.categories') },
            { to: '/community', icon: 'fa-users', label: t('home.community') },
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