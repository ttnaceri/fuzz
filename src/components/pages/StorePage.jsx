import { useMemo, useState } from 'react';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { useCart } from '../context/useCart.js';
import { GENRES } from '../utils/constants.js';

export default function StorePage() {
  const { games, loading, error, reload } = useGames();
  const { addItem } = useCart();
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('title');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    let list = games;
    if (genre) list = list.filter((g) => (g.genres || [g.genre]).includes(genre));
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
      return a.title.localeCompare(b.title);
    });
  }, [games, genre, sort, q]);

  return (
    <div className="page">
      <h1 className="page-title">Store</h1>
      <div className="filters">
        <input
          type="search"
          placeholder="Filter by title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>
      {loading && <Loading />}
      {error && !loading && <ErrorState message={error.message} onRetry={reload} />}
      {!loading && !error && (
        <GameGrid games={filtered} onAddToCart={addItem} emptyMessage="No games match your filters." />
      )}
    </div>
  );
}