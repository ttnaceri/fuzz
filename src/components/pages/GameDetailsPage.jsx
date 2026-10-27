import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gameService } from '../services/gameService.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/useCart.js';
import useToast from '../hooks/useToast.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const { success } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    gameService
      .getGameById(id, { signal: controller.signal })
      .then((g) => setGame(g))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error.message} />;
  if (!game) return <ErrorState title="Game not found" message="This game does not exist." />;

  const cover = game.cover || game.image;
  const unavailable = game.available === false || game.availability === 'unavailable';

  const handleAdd = () => {
    addItem(game);
    success(`"${game.title}" added to cart`);
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
          <div className="mt-2">
            {(game.genres || [game.genre]).filter(Boolean).map((g) => (
              <span key={g} className="badge badge-warning" style={{ marginRight: 6 }}>{g}</span>
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
          <div className="game-details__actions">
            <button className="btn btn-primary btn-block" onClick={handleAdd}>
              <i className="fa-solid fa-cart-plus" /> Add to cart
            </button>
            {game.officialStore && (
              <a
                className="btn btn-secondary btn-block"
                href={game.officialStore}
                target="_blank"
                rel="noreferrer noopener"
              >
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
    </div>
  );
}