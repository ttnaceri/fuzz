import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminReviews() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.reviews().then((r) => setData(r?.reviews || r || [])).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Reviews</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
    </div>
  );
}