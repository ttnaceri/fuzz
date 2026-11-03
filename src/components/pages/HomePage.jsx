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
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/api/events').then(data => setEvents(data.events || [])).catch(() => {});
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__content">
          <h1>{t('home.welcome')}</h1>
          <p>{t('home.subtitle')}</p>
          <Link to="/store" className="btn btn-primary">{t('home.browseBtn')}</Link>
        </div>
      </section>

      {events.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2 className="section__title">Aktiv Eventlar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {events.map(ev => (
              <Link key={ev.id} to={ev.link_url || '#'} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden', height: '100%' }}>
                  {ev.image && <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ color: '#f5eeee', margin: 0 }}>{ev.title}</h3>
                    <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginTop: '0.5rem' }}>Tugaydi: {new Date(ev.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">{t('home.featured')}</h2>
          <Link to="/store" className="text-muted">{t('home.viewAll')} →</Link>
        </div>
        {loading && <Loading label="Loading games..." />}
        {error && !loading && <ErrorState message={error.message} onRetry={reload} />}
        {!loading && !error && games.length > 0 && <GameGrid games={games} onAddToCart={addItem} />}
      </section>
    </div>
  );
}