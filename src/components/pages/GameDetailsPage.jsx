import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { gameService } from '../services/gameService.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/useCart.js';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

    // 1. O'yinni yuklash
    gameService
      .getGameById(id, { signal: controller.signal })
      .then((g) => {
        setGame(g);
        // 2. Agar o'yin topsa, uni qaysi bundle'larga tegishli ekanligini qidirish
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

  // 3. Wishlist'da bor-yo'qligini tekshirish
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
  if (!game) return <ErrorState title="Game not found" message="This game does not exist." />;

  const cover = game.cover || game.image;
  const unavailable = game.available === false || game.availability === 'unavailable';

  const handleAdd = () => {
    addItem(game);
    success(`"${game.title}" savatga qo'shildi`);
  };

  // Wishlist toggle
  const toggleWishlist = async () => {
    if (!user) {
      toastError("Wishlistga qo'shish uchun tizimga kiring");
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/api/wishlist/${user.id}/${game.id}`);
        setInWishlist(false);
        success("Wishlistdan o'chirildi");
      } else {
        await api.post('/api/wishlist', { gameId: game.id });
        setInWishlist(true);
        success("Wishlistga qo'shildi");
      }
    } catch (err) {
      toastError(err.message || 'Xatolik yuz berdi');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/store" className="text-muted">← Back to store</Link>
      
      <div className="game-details">
        <div>
          <div className="game-details__hero">
            <img src={cover} alt={game.title} />
          </div>
          <h1 style={{ marginTop: '1rem' }}>{game.title}</h1>
          <p className="text-muted">{game.description}</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
            {(game.genres || [game.genre]).filter(Boolean).map((g) => (
              <span key={g} className="badge badge-warning" style={{ backgroundColor: 'rgba(240, 180, 77, 0.15)', color: '#f0b44d', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(240, 180, 77, 0.3)' }}>
                {g}
              </span>
            ))}
          </div>
        </div>
        
        <aside className="game-details__side">
          <div className="game-details__price">{formatPrice(game.price, game.currency)}</div>
          
          {unavailable && (
            <div className="unavailable-notice">
              <i className="fa-solid fa-triangle-exclamation" /> Download unavailable — file not present.
            </div>
          )}
          
          <div className="game-details__actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-block" onClick={handleAdd}>
              <i className="fa-solid fa-cart-plus" /> Add to cart
            </button>
            
            {/* WISHLIST TUGMASI */}
            <button 
              className="btn btn-secondary btn-block" 
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <i className={`fa-${inWishlist ? 'solid' : 'regular'} fa-heart`} style={{ color: inWishlist ? '#ed5555' : 'inherit' }} />
              {wishlistLoading ? 'Yuklanmoqda...' : (inWishlist ? "Wishlistdan o'chirish" : "Wishlistga qo'shish")}
            </button>

            {game.officialStore && (
              <a className="btn btn-secondary btn-block" href={game.officialStore} target="_blank" rel="noreferrer noopener">
                <i className="fa-solid fa-arrow-up-right-from-square" /> Official store
              </a>
            )}
          </div>
          
          <div className="game-details__meta">
            <div><span>Developer</span><strong>{game.developer || '—'}</strong></div>
            <div><span>Publisher</span><strong>{game.publisher || '—'}</strong></div>
            <div><span>Release</span><strong>{formatDate(game.releaseDate)}</strong></div>
            <div><span>Genre</span><strong>{game.genre || '—'}</strong></div>
          </div>
        </aside>
      </div>

      {bundles.length > 0 && (
        <section className="section" style={{ marginTop: '3rem' }}>
          <div className="section__header">
            <h2 className="section__title">Ushbu o'yin kiritilgan Bundle'lar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {bundles.map(b => (
              <Link key={b.id} to={`/bundle/${b.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#100b0a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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