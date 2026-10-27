import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminLogs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.logs().then((r) => setData(r?.logs || r || [])).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Logs</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
      {data.length > 0 && (
        <table className="admin-table">
          <thead><tr><th>Time</th><th>Level</th><th>Message</th></tr></thead>
          <tbody>
            {data.map((l, i) => <tr key={i}><td>{l.time}</td><td>{l.level}</td><td>{l.message}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}