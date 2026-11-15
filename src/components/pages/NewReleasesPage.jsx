import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';

export default function NewReleasesPage() {
  const { games, loading } = useGames({ filter: 'new' });
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <div className="page">
      <h1 className="page-title">{t('home.newReleases') || 'New Releases'}</h1>
      {loading ? <Loading /> : <GameGrid games={games} onAddToCart={addItem} />}
    </div>
  );
}