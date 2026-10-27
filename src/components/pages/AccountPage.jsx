import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();
  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Account</h1>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p><strong>Signed in as:</strong> {user?.username || user?.email || '—'}</p>
          <button className="btn btn-secondary mt-2" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}