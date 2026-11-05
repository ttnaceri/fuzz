import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters.js';

export default function GameCard({ game, onAddToCart }) {
  const cover = game.image || game.cover;
  const isUnavailable = game.available === false;
  const finalPrice = game.discount > 0 
    ? game.price - (game.price * (game.discount / 100)) 
    : game.price;

  return (
    <article className="game-card">
      <div className="game-card__media">
        <Link to={`/game/${game.id}`} aria-label={game.title}>
          {cover && <img src={cover} alt={game.title} loading="lazy" />}
        </Link>
        
        {/* Hover ma'lumotlari */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0,
          transition: 'opacity 0.2s',
          padding: '1rem',
          textAlign: 'center'
        }}
        className="game-card__overlay">
          <p style={{ color: '#b9a6a2', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {game.description || 'Tavsif yo\'q'}
          </p>
          <p style={{ color: '#f0b44d', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {game.genre || 'Game'}
          </p>
        </div>
      </div>
      
      <style>{`
        .game-card:hover .game-card__overlay {
          opacity: 1;
        }
      `}</style>
      
      <div className="game-card__body">
        <h3 className="game-card__title" title={game.title}>{game.title}</h3>
        <p className="game-card__desc">{game.genre || 'Game'}</p>
        
        <div className="game-card__meta">
          {game.discount > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="game-card__price" style={{ color: '#43b581' }}>${finalPrice.toFixed(2)}</span>
              <span style={{ textDecoration: 'line-through', color: '#b9a6a2', fontSize: '0.8rem' }}>${game.price}</span>
              <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>-{game.discount}%</span>
            </div>
          ) : (
            <span className="game-card__price">{formatPrice(game.price)}</span>
          )}
        </div>

        <div className="game-card__actions">
          <Link to={`/game/${game.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <i className="fa-solid fa-circle-info" /> Batafsil
          </Link>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onAddToCart?.(game)} 
            disabled={isUnavailable}
            title={isUnavailable ? 'Mavjud emas' : 'Savatga qo\'shish'}
          >
            <i className="fa-solid fa-cart-plus" />
          </button>
        </div>
      </div>
    </article>
  );
}