import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="state" style={{ minHeight: '60vh' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <h3>Page not found</h3>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}