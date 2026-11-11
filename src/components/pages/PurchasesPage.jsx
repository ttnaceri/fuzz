import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';

export default function PurchasesPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/api/users/${user.id}/payments`)
      .then(data => {
        setPayments(data.payments || []);
      })
      .catch(err => {
        console.error("To'lovlarni yuklashda xato:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const exportToExcel = () => {
    if (payments.length === 0) return;
    const headers = ['Sana', 'Miqdor (USD)', 'Stars (agar bo\'lsa)'];
    const rows = payments.map(p => [
      new Date(p.created_at).toLocaleString(),
      `$${Number(p.amount_usd).toFixed(2)}`,
      p.stars_paid || '—'
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fuzz_purchases_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Xaridlar Tarixi</h1>
          {payments.length > 0 && (
            <button onClick={exportToExcel} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#241411', color: '#43b581', border: '1px solid #43b581', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-file-excel"></i> Excel'ga yuklash
            </button>
          )}
        </div>

        {loading && <Loading />}
        {error && <p style={{ color: '#ed5555' }}>{error.message}</p>}
        {!loading && !error && payments.length === 0 && (
          <EmptyState icon="fa-receipt" title="Hali xaridlar yo'q" message="Siz hali hech qanday to'lov qilmadingiz." />
        )}
        {!loading && payments.length > 0 && (
          <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#19100e', color: '#b9a6a2', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Sana</th>
                  <th style={{ padding: '1rem' }}>Miqdor</th>
                  <th style={{ padding: '1rem' }}>Stars</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #48201a', color: '#f5eeee' }}>
                    <td style={{ padding: '1rem' }}>{new Date(p.created_at).toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#43b581', fontWeight: 'bold' }}>+${Number(p.amount_usd).toFixed(2)}</td>
                    <td style={{ padding: '1rem', color: '#b9a6a2' }}>{p.stars_paid ? `${p.stars_paid} ⭐` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}