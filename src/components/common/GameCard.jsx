import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters.js';

export default function GameCard({ game, onAddToCart }) {
  const navigate = useNavigate();
  const cover = game.image || game.cover;
  const isUnavailable = game.available === false || game.availability === 'unavailable';

  // Janrlarni massivga ajratamiz (agar vergul bilan yozilgan bo'lsa)
  const genres = game.genres || (game.genre ? game.genre.split(',').map(g => g.trim()) : []);

  // Kartochkaning o'ziga bosilganda ishlaydigan funksiya
  const handleCardClick = (e) => {
    // Agar tugma bosilgan bo'lsa, kartochka o'tishini to'xtatamiz
    if (e.target.closest('button')) return;
    navigate(`/game/${game.id}`);
  };

  return (
    <article 
      className="game-card" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="game-card__media">
        {cover && (
          <img
            src={cover}
            alt={game.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
      
      <div className="game-card__body">
        <h3 className="game-card__title" title={game.title}>{game.title}</h3>
        
        {/* Janrlarni chiroyli shakllarda (badge) chiqaramiz */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
          {genres.map((g, idx) => (
            <span 
              key={idx} 
              style={{
                backgroundColor: 'rgba(240, 180, 77, 0.15)', // Sariq rangning shaffof varianti
                color: '#f0b44d',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: '1px solid rgba(240, 180, 77, 0.3)'
              }}
            >
              {g}
            </span>
          ))}
        </div>

        <div className="game-card__meta">
          {game.discount > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="game-card__price" style={{ color: '#43b581' }}>
                {formatPrice(game.price - (game.price * game.discount / 100), game.currency)}
              </span>
              <span style={{ textDecoration: 'line-through', color: '#b9a6a2', fontSize: '0.8rem' }}>
                {formatPrice(game.price, game.currency)}
              </span>
              <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                -{game.discount}%
              </span>
            </div>
          ) : (
            <span className="game-card__price">{formatPrice(game.price, game.currency)}</span>
          )}
        </div>

        {isUnavailable && (
          <div className="badge badge-error" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            Download unavailable
          </div>
        )}

        <div className="game-card__actions">
          <Link to={`/game/${game.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <i className="fa-solid fa-circle-info" /> Batafsil
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation(); // Tugma bosilganda kartochka o'tib ketmasligi uchun
              onAddToCart?.(game);
            }}
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