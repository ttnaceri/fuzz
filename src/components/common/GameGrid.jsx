import GameCard from './GameCard.jsx';
import EmptyState from './EmptyState.jsx';

export default function GameGrid({ games, onAddToCart, emptyMessage = 'No games found.' }) {
  if (!games || games.length === 0) {
    return <EmptyState icon="fa-gamepad" title="No games" message={emptyMessage} />;
  }
  return (
    <div className="game-grid">
      {games.map((g) => (
        <GameCard key={g.id} game={g} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}