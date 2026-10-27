import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Loading from './Loading.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && !isAdmin) {
    return (
      <div className="state">
        <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: 'var(--color-error)' }} />
        <h3>403 — Access denied</h3>
        <p>You need administrator privileges.</p>
      </div>
    );
  }
  return children;
}