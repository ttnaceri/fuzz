import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { gameService } from '../services/gameService.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [game, setGame] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addItem } = useCart();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    gameService
      .getGameById(id, { signal: controller.signal })
      .then((g) => {
        setGame(g);
        if (g) {
          api.get('/api/bundles')
            .then(async (res) => {
              const allBundles = res.bundles || [];
              const relatedBundles = [];
              for (const b of allBundles) {
                try {
                  const bGames = await api.get(`/api/bundles/${b.id}/games`);
                  if (bGames.games?.some(bg => bg.id === g.id)) {
                    relatedBundles.push(b);
                  }
                } catch { /* ignore */ }
              }
              setBundles(relatedBundles);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (user && game) {
      api.get(`/api/users/${user.id}/wishlist`)
        .then(res => {
          const found = res.games?.some(g => g.id === game.id);
          setInWishlist(found);
        })
        .catch(() => {});
    }
  }, [user, game]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error.message} />;
  if (!game) return <ErrorState title={t('game.notFound')} message={t('game.notFoundSub')} />;

  const cover = game.cover || game.image;
  const unavailable = game.available === false || game.availability === 'unavailable';

  const discount = Number(game.discount) || 0;
  const originalPrice = Number(game.price) || 0;
  const finalPrice = discount > 0 ? originalPrice - (originalPrice * discount / 100) : originalPrice;
  const hasDiscount = discount > 0;

  const handleAdd = () => {
    addItem(game);
    success(`"${game.title}" ${t('game.addedToCart')}`);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toastError(t('wishlist.loginRequired'));
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/api/wishlist/${user.id}/${game.id}`);
        setInWishlist(false);
        success(t('wishlist.removed'));
      } else {
        await api.post('/api/wishlist', { gameId: game.id });
        setInWishlist(true);
        success(t('wishlist.added'));
      }
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/store" className="text-muted">← {t('game.backToStore')}</Link>

      <div className="game-details">
        <div>
          <div className="game-details__hero">
            <img src={cover} alt={game.title} />
          </div>
          <h1 style={{ marginTop: '1rem' }}>{game.title}</h1>
          <p className="text-muted">{game.description}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
            {(game.genres || [game.genre]).filter(Boolean).map((g) => (
              <span
                key={g}
                className="badge badge-warning"
                style={{
                  backgroundColor: 'rgba(240, 180, 77, 0.15)',
                  color: '#f0b44d',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(240, 180, 77, 0.3)',
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        <aside className="game-details__side">
          {hasDiscount ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div className="game-details__price" style={{ color: '#43b581', margin: 0 }}>
                {formatPrice(finalPrice, game.currency)}
              </div>
              <div style={{ textDecoration: 'line-through', color: '#b9a6a2', fontSize: '1rem' }}>
                {formatPrice(originalPrice, game.currency)}
              </div>
              <div
                style={{
                  backgroundColor: '#f0b44d',
                  color: '#000',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                -{discount}%
              </div>
            </div>
          ) : (
            <div className="game-details__price" style={{ marginBottom: '1rem' }}>
              {originalPrice === 0 ? t('game.free') : formatPrice(originalPrice, game.currency)}
            </div>
          )}

          {unavailable && (
            <div className="unavailable-notice">
              <i className="fa-solid fa-triangle-exclamation" /> {t('game.unavailable')}
            </div>
          )}

          <div className="game-details__actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-block" onClick={handleAdd}>
              <i className="fa-solid fa-cart-plus" /> {t('game.addToCart')}
            </button>

            <button
              className="btn btn-secondary btn-block"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <i
                className={`fa-${inWishlist ? 'solid' : 'regular'} fa-heart`}
                style={{ color: inWishlist ? '#ed5555' : 'inherit' }}
              />
              {wishlistLoading
                ? t('common.loading')
                : inWishlist
                  ? t('wishlist.remove')
                  : t('wishlist.add')}
            </button>

            {game.officialStore && (
              <a
                className="btn btn-secondary btn-block"
                href={game.officialStore}
                target="_blank"
                rel="noreferrer noopener"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" /> {t('game.officialStore')}
              </a>
            )}
          </div>

          <div className="game-details__meta">
            <div><span>{t('game.developer')}</span><strong>{game.developer || '—'}</strong></div>
            <div><span>{t('game.publisher')}</span><strong>{game.publisher || '—'}</strong></div>
            <div><span>{t('game.releaseDate')}</span><strong>{formatDate(game.releaseDate)}</strong></div>
            <div><span>{t('game.genre')}</span><strong>{game.genre || '—'}</strong></div>
          </div>
        </aside>
      </div>

      {bundles.length > 0 && (
        <section className="section" style={{ marginTop: '3rem' }}>
          <div className="section__header">
            <h2 className="section__title">{t('game.inBundles')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {bundles.map(b => (
              <Link key={b.id} to={`/bundle/${b.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#100b0a',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="fa-solid fa-box-open" style={{ color: '#8a1200', fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#f5eeee' }}>{b.name}</h3>
                    <p style={{ margin: 0, color: '#b9a6a2', fontSize: '0.85rem' }}>{formatPrice(b.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}