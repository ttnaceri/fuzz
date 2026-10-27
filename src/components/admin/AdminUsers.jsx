import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.users().then((r) => setUsers(r?.users || r || [])).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Users</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
      {users.length > 0 && (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>
            {users.map((u) => <tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}