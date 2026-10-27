import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters.js';

export default function GameCard({ game, onAddToCart }) {
  const cover = game.cover || game.image;
  const priceLabel = formatPrice(game.price, game.currency);
  const isUnavailable = game.available === false || game.availability === 'unavailable';

  return (
    <article className="game-card">
      <div className="game-card__media">
        <Link to={`/game/${game.id}`} aria-label={game.title}>
          <img
            src={cover}
            alt={game.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title" title={game.title}>{game.title}</h3>
        <p className="game-card__desc">{game.description}</p>
        <div className="game-card__meta">
          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
            {game.genre || (game.genres && game.genres[0]) || 'Game'}
          </span>
          <span className="game-card__price">{priceLabel}</span>
        </div>
        {isUnavailable && (
          <div className="badge badge-error" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            Download unavailable
          </div>
        )}
        <div className="game-card__actions">
          <Link to={`/game/${game.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <i className="fa-solid fa-circle-info" /> Details
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onAddToCart?.(game)}
            disabled={isUnavailable}
            title={isUnavailable ? 'Unavailable' : 'Add to cart'}
          >
            <i className="fa-solid fa-cart-plus" />
          </button>
        </div>
      </div>
    </article>
  );
}