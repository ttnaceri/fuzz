import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';

export default function FreeGamesPage() {
  const { games, loading } = useGames({ filter: 'free' });
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="page">
      <h1 className="page-title">{t('home.freeGames') || 'Free Games'}</h1>
      {loading ? <Loading /> : <GameGrid games={games} onAddToCart={addItem} />}
    </div>
  );
}