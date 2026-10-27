import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const genre = params.get('genre') || '';
  const { games, loading } = useGames();
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    let list = games;
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q.toLowerCase()));
    if (genre) list = list.filter((g) => (g.genres || [g.genre]).includes(genre));
    return list;
  }, [games, q, genre]);

  return (
    <div className="page">
      <h1 className="page-title">Search results {q ? `for "${q}"` : ''}</h1>
      {loading ? <Loading /> : <GameGrid games={filtered} onAddToCart={addItem} emptyMessage="No matches found." />}
    </div>
  );
}