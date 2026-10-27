import { useMemo } from 'react';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';

export default function FreeGamesPage() {
  const { games, loading } = useGames();
  const { addItem } = useCart();
  const free = useMemo(() => games.filter((g) => Number(g.price) === 0), [games]);
  return (
    <div className="page">
      <h1 className="page-title">Free Games</h1>
      {loading ? <Loading /> : <GameGrid games={free} onAddToCart={addItem} emptyMessage="No free games right now." />}
    </div>
  );
}