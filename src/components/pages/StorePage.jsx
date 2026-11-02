import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useCart } from '../context/useCart.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';

export default function StorePage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    api.get('/api/games')
      .then(data => { setGames(data.games || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAddToCart = (game) => {
    addItem(game);
  };

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1 className="page-title" style={{ color: '#f5eeee' }}>Do'kon</h1>
      {loading ? <Loading /> : <GameGrid games={games} onAddToCart={handleAddToCart} emptyMessage="Hozircha o'yinlar yo'q." />}
    </div>
  );
}