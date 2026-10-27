import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.categories().then((r) => setData(r?.categories || r || [])).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Categories</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
    </div>
  );
}