import { useMemo } from 'react';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';

export default function NewReleasesPage() {
  const { games, loading } = useGames();
  const { addItem } = useCart();
  const sorted = useMemo(
    () => [...games].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)),
    [games]
  );
  return (
    <div className="page">
      <h1 className="page-title">New Releases</h1>
      {loading ? <Loading /> : <GameGrid games={sorted} onAddToCart={addItem} />}
    </div>
  );
}