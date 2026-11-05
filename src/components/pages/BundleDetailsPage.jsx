import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';

export default function BundleDetailsPage() {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBundle = async () => {
      setLoading(true);
      setError(null);
      try {
        const bundleData = await api.get(`/api/bundles/${id}`);
        setBundle(bundleData.bundle);

        const gamesData = await api.get(`/api/bundles/${id}/games`);
        setGames(gamesData.games || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [id]);

  if (loading) return <Loading label="Loading bundle..." />;
  if (error) return <ErrorState title="Could not load bundle" message={error.message} />;
  if (!bundle) return <ErrorState title="Bundle not found" message="This bundle does not exist." />;

  return (
    <div className="page">
      <Link to="/store" className="text-muted">← Back to store</Link>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <img 
            src={bundle.image} 
            alt={bundle.name} 
            style={{ width: '100%', borderRadius: '8px', border: '1px solid #48201a' }} 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div style={{ flex: '2 1 400px' }}>
          <h1 style={{ color: '#f5eeee', marginBottom: '0.5rem' }}>{bundle.name}</h1>
          <p style={{ color: '#b9a6a2', lineHeight: 1.6 }}>{bundle.description || 'No description available.'}</p>
          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#43b581' }}>
              {formatPrice(bundle.price, 'USD')}
            </span>
            {bundle.discount > 0 && (
              <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                -{bundle.discount}%
              </span>
            )}
          </div>
          <button className="btn btn-primary">Add Bundle to Cart</button>
        </div>
      </div>

      <div className="section" style={{ marginTop: '3rem' }}>
        <h2 className="section__title" style={{ marginBottom: '1.5rem' }}>Games in this bundle</h2>
        {games.length === 0 ? (
          <p style={{ color: '#b9a6a2' }}>This bundle does not contain any games yet.</p>
        ) : (
          <div className="game-grid">
            {games.map(game => (
              <div key={game.id} className="game-card">
                 <div className="game-card__media">
                    <Link to={`/game/${game.id}`}>
                        <img src={game.image} alt={game.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </Link>
                </div>
                <div className="game-card__body">
                    <h3 className="game-card__title">{game.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}