import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gameService } from '../services/gameService.js';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/useCart.js';
import { useSound } from '../hooks/useSound.js';

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const { playNotification } = useSound();

  useEffect(() => {
    const controller = new AbortController();
    gameService.getGameById(id, { signal: controller.signal })
      .then(setGame)
      .catch(err => { if (err.name !== 'AbortError') setError(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error.message} />;
  if (!game) return <ErrorState title="O'yin topilmadi" message="Bunday o'yin mavjud emas." />;

  const cover = game.cover || game.image;

  const handleAddToCart = () => {
    addItem(game);
    playNotification(); // Ovoz effekti
  };

  return (
    <div className="page">
      <Link to="/store" className="text-muted">← Do'konga qaytish</Link>
      <div className="game-details">
        <div>
          <div className="game-details__hero">
            <img src={cover} alt={game.title} />
          </div>
          <h1 style={{ marginTop: '1rem' }}>{game.title}</h1>
          <p className="text-muted">{game.description}</p>
          <div className="mt-2">
            {(game.genres || [game.genre]).filter(Boolean).map(g => (
              <span key={g} className="badge badge-warning" style={{ marginRight: 6 }}>{g}</span>
            ))}
          </div>
        </div>
        <aside className="game-details__side">
          <div className="game-details__price">
            {game.isHtmlGame ? 'Bepul (HTML5)' : formatPrice(game.price, game.currency)}
          </div>
          
          <div className="game-details__actions">
            {game.isHtmlGame ? (
              <a href={game.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-block" onClick={playNotification}>
                <i className="fa-solid fa-play" /> Hozir o'ynash
              </a>
            ) : (
              <div className="flex flex-col gap-2">
                <button className="btn btn-primary btn-block" onClick={handleAddToCart}>
                  <i className="fa-solid fa-cart-plus" /> Savatga qo'shish
                </button>
                <a href={game.downloadUrl} download className="btn btn-secondary btn-block">
                  <i className="fa-solid fa-download" /> Yuklab olish
                </a>
              </div>
            )}
          </div>
          
          <div className="game-details__meta">
            <div><span>Ishlab chiqaruvchi</span><strong>{game.developer || '—'}</strong></div>
            <div><span>Nashriyotchi</span><strong>{game.publisher || '—'}</strong></div>
            <div><span>Chiqish sanasi</span><strong>{formatDate(game.releaseDate)}</strong></div>
            <div><span>Janr</span><strong>{game.genre || '—'}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}