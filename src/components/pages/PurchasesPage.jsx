import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { cartService } from '../services/cartService.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate, formatPrice } from '../utils/formatters.js';

export default function PurchasesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!api.isConfigured()) { setLoading(false); return; }
    cartService.orders()
      .then((r) => setOrders(r?.orders || r || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">Purchases</h1>
        {!api.isConfigured() && <div className="unavailable-notice">Backend required.</div>}
        {loading && api.isConfigured() && <Loading />}
        {error && <p className="text-muted">{error.message}</p>}
        {!loading && orders.length === 0 && api.isConfigured() && (
          <EmptyState icon="fa-receipt" title="No purchases yet" />
        )}
        {orders.length > 0 && (
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Date</th><th>Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{formatDate(o.createdAt || o.date)}</td>
                  <td>{formatPrice(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}