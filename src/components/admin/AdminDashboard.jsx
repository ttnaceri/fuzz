import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.stats().then(setStats).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Dashboard</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required for statistics.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
      {stats && (
        <div className="stat-grid">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="stat-card">
              <div className="stat-card__label">{k}</div>
              <div className="stat-card__value">{String(v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}