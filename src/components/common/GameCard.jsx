import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import { formatPrice } from '../utils/formatters.js';

export default function GameCard({ game, onAddToCart }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const cover = game.image || game.cover;
  const isUnavailable = game.available === false || game.availability === 'unavailable';

  // Telefon yoki kompyuter ekanligini aniqlash (Kichikroq qilish uchun)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const genres = game.genres || (game.genre ? game.genre.split(',').map((g) => g.trim()) : []);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/game/${game.id}`);
  };

  return (
    <article
      className="game-card"
      onClick={handleCardClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#241411',
        borderRadius: '8px',
        border: '1px solid #48201a',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div
        className="game-card__media"
        style={{
          height: isMobile ? '110px' : '150px', // Telefonda rasm balandligi kichraytirildi
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {cover && (
          <img
            src={cover}
            alt={game.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>

      <div
        className="game-card__body"
        style={{
          padding: isMobile ? '0.6rem' : '1rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            className="game-card__title"
            title={game.title}
            style={{
              color: '#f5eeee',
              fontSize: isMobile ? '0.85rem' : '1rem', // Shrift kichraytirildi
              margin: '0 0 0.3rem 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {game.title}
          </h3>

          {/* Janrlar (Telefonda kichikroq) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.3rem 0' }}>
            {genres.slice(0, 2).map((g, idx) => ( // Telefonda ko'pi bilan 2 ta janr ko'rsatamiz
              <span
                key={idx}
                style={{
                  backgroundColor: 'rgba(240, 180, 77, 0.15)',
                  color: '#f0b44d',
                  padding: isMobile ? '0.05rem 0.3rem' : '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: isMobile ? '0.55rem' : '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(240, 180, 77, 0.3)',
                }}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Narx */}
          <div className="game-card__meta" style={{ marginTop: '0.3rem' }}>
            {game.discount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#43b581', fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: 'bold' }}>
                  {formatPrice(game.price - (game.price * game.discount / 100), game.currency)}
                </span>
                <span style={{ textDecoration: 'line-through', color: '#b9a6a2', fontSize: isMobile ? '0.65rem' : '0.8rem' }}>
                  {formatPrice(game.price, game.currency)}
                </span>
                <span style={{ backgroundColor: '#f0b44d', color: '#000', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 'bold' }}>
                  -{game.discount}%
                </span>
              </div>
            ) : (
              <span style={{ color: '#43b581', fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: 'bold' }}>
                {game.price === 0 ? t('game.free') : formatPrice(game.price, game.currency)}
              </span>
            )}
          </div>
        </div>

        {isUnavailable && (
          <div className="badge badge-error" style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: '0.6rem' }}>
            {t('game.unavailable')}
          </div>
        )}

        {/* Tugmalar (Telefonda yonma-yon sig'ishi uchun ixchamlashtirildi) */}
        <div className="game-card__actions" style={{ display: 'flex', gap: '0.3rem', marginTop: '0.6rem' }}>
          <Link
            to={`/game/${game.id}`}
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1,
              padding: isMobile ? '0.3rem' : '0.5rem',
              fontSize: isMobile ? '0.7rem' : '0.85rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <i className="fa-solid fa-circle-info" /> <span>{isMobile ? '' : t('game.details')}</span>
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(game);
            }}
            disabled={isUnavailable}
            title={isUnavailable ? t('game.unavailable') : t('game.addToCart')}
            style={{
              padding: isMobile ? '0.3rem 0.5rem' : '0.5rem',
              fontSize: isMobile ? '0.7rem' : '1rem',
            }}
          >
            <i className="fa-solid fa-cart-plus" />
          </button>
        </div>
      </div>
    </article>
  );
}