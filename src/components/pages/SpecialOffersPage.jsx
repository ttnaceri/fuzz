import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';

export default function SpecialOffersPage() {
  const { games, loading } = useGames({ filter: 'discount' });
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="page">
      <h1 className="page-title">{t('home.specialOffers') || 'Special Offers'}</h1>
      {loading ? <Loading /> : (
        games.length > 0 ? (
          <GameGrid games={games} onAddToCart={addItem} />
        ) : (
          <p className="text-muted" style={{ marginTop: '2rem' }}>
            Hozircha chegirmadagi o'yinlar yo'q.
          </p>
        )
      )}
    </div>
  );
}