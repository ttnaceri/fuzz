import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import { api } from '../services/api.js';

export default function HomePage() {
  const { games, loading, error, reload } = useGames();
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Eventlarni yuklash
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    api.get('/api/events')
      .then(data => {
        setEvents(data.events || []);
        setLoadingEvents(false);
      })
      .catch(() => {
        setLoadingEvents(false);
      });
  }, []);

  return (
    <div className="page">
      
      {/* ==========================================
          EVENTLAR (Banner ko'rinishida)
          ========================================== */}
      {!loadingEvents && events.length > 0 && (
        <section className="section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #48201a',
                  backgroundColor: '#241411',
                }}
              >
                {/* Agar event havolasi bo'lsa, rasmni bosganda o'tadi */}
                <Link to={event.link_url || '#'} target={event.link_url?.startsWith('http') ? '_blank' : '_self'} style={{ display: 'block' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {/* Rasm ustidagi yozuv */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2rem 1.5rem 1rem',
                    background: 'linear-gradient(to top, rgba(16, 11, 10, 0.95) 0%, rgba(16, 11, 10, 0) 100%)',
                    color: '#f5eeee',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{event.title}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero Section (Standart) */}
      {events.length === 0 && (
        <section className="hero">
          <div className="hero__content">
            <h1>{t('home.welcome')}</h1>
            <p>{t('home.subtitle')}</p>
            <Link to="/store" className="btn btn-primary">{t('home.browseBtn')}</Link>
          </div>
        </section>
      )}

      {/* Featured Games Section */}
      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{t('home.featured')}</h2>
          <Link to="/store" className="text-muted">{t('home.viewAll')} →</Link>
        </div>
        
        {loading && <Loading label="Loading games..." />}
        
        {error && !loading && (
          <ErrorState
            title="Could not load games"
            message={error.message}
            onRetry={reload}
          />
        )}
        
        {!loading && !error && games.length > 0 && (
          <GameGrid games={games} onAddToCart={addItem} />
        )}
        
        {!loading && !error && games.length === 0 && (
          <div className="state" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b9a6a2' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fa-solid fa-gamepad" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#48201a' }}></i>
              <p>Hozircha o'yinlar yo'q. Admin panel orqali o'yin qo'shing.</p>
            </div>
          </div>
        )}
      </section>

      {/* Quick Links Section */}
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