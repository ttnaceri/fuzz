import { Link } from 'react-router-dom';
import { GENRES } from '../utils/constants.js';

export default function CategoriesPage() {
  return (
    <div className="page">
      <h1 className="page-title">Categories</h1>
      <div className="game-grid">
        {GENRES.map((g) => (
          <Link
            key={g}
            to={`/search?genre=${encodeURIComponent(g)}`}
            className="card"
            style={{ padding: '1.5rem', textAlign: 'center' }}
          >
            <i className="fa-solid fa-tag" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>{g}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}