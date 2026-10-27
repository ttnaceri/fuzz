import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';

export default function SpecialOffersPage() {
  const { games, loading } = useGames();
  const { addItem } = useCart();
  return (
    <div className="page">
      <h1 className="page-title">Special Offers</h1>
      <p className="text-muted mb-2">Backend discounts will appear here when available.</p>
      {loading ? <Loading /> : <GameGrid games={games} onAddToCart={addItem} />}
    </div>
  );
}