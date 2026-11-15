import { useState, useMemo } from 'react';
import useGames from '../hooks/useGames.js';
import GameGrid from '../common/GameGrid.jsx';
import Loading from '../common/Loading.jsx';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';

export default function CategoriesPage() {
  const { games, loading } = useGames(); // Barcha o'yinlar
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Barcha mavjud janrlarni yig'ish
  const allGenres = useMemo(() => {
    const genres = new Set();
    games.forEach(game => {
      if (game.genre) {
        game.genre.split(',').forEach(g => {
          const clean = g.trim();
          if (clean) genres.add(clean);
        });
      }
    });
    return Array.from(genres).sort();
  }, [games]);

  // Tanlangan janrlarga qarab o'yinlarni filtrlash
  const filteredGames = useMemo(() => {
    if (selectedGenres.length === 0) return games;
    return games.filter(game => {
      if (!game.genre) return false;
      const gameGenres = game.genre.split(',').map(g => g.trim());
      return selectedGenres.some(sg => gameGenres.includes(sg));
    });
  }, [games, selectedGenres]);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="page">
      <h1 className="page-title">{t('home.categories') || 'Kategoriyalar'}</h1>

      {!loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          {allGenres.map(genre => (
            <label
              key={genre}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#241411',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid #48201a',
                cursor: 'pointer',
                color: selectedGenres.includes(genre) ? '#f5eeee' : '#b9a6a2',
                borderColor: selectedGenres.includes(genre) ? '#8a1200' : '#48201a',
              }}
            >
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenre(genre)}
                style={{ accentColor: '#8a1200' }}
              />
              {genre}
            </label>
          ))}
        </div>
      )}

      {loading ? <Loading /> : (
        filteredGames.length > 0 ? (
          <GameGrid games={filteredGames} onAddToCart={addItem} />
        ) : (
          <p className="text-muted">Tanlangan kategoriyada o'yinlar topilmadi.</p>
        )
      )}
    </div>
  );
}