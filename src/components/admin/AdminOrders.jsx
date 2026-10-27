import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { adminService } from '../services/adminService.js';
import Loading from '../common/Loading.jsx';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    adminService.orders().then((r) => setOrders(r?.orders || r || [])).catch(setError).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-header"><h1>Orders</h1></div>
      {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
      {loading && api.isConfigured() && <Loading />}
      {error && <p className="text-muted">{error.message}</p>}
      {orders.length > 0 && (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>User</th><th>Total</th></tr></thead>
          <tbody>
            {orders.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.userId}</td><td>{o.total}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}