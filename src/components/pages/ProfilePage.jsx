import useAuth from '../hooks/useAuth.js';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h1 className="page-title">Profile</h1>
      <div className="card" style={{ padding: '1.5rem' }}>
        <p><strong>Username:</strong> {user?.username || '—'}</p>
        <p><strong>Email:</strong> {user?.email || '—'}</p>
        <p><strong>Role:</strong> {user?.role || 'user'}</p>
      </div>
    </div>
  );
}