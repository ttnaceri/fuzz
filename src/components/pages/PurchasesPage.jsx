import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import Sidebar from '../common/Sidebar.jsx';
import Loading from '../common/Loading.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatDate } from '../utils/formatters.js';

export default function PurchasesPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // User o'z to'lovlarini backenddan yoki local storage'dan oladi
    // Agar sizda local storage bo'lsa, uni ishlatish mumkin.
    // Bu yerda biz backenddan userning paymentlarini olamiz (agar endpoint bor bo'lsa).
    // Hozircha local storage'dan o'qiymiz.
    const stored = localStorage.getItem('fuzz_user_payments');
    if (stored) {
      setPayments(JSON.parse(stored));
    } else {
      // Backenddan olish (agar endpoint bo'lsa)
      api.get('/api/admin/payments') // Vaqtinchalik admin endpoint
        .then(data => {
          const userPayments = (data.payments || []).filter(p => p.user_id === JSON.parse(localStorage.getItem('fuzz_auth'))?.user?.id);
          setPayments(userPayments);
        })
        .catch(err => console.warn('Backenddan olishda xato:', err))
        .finally(() => setLoading(false));
    }
    setLoading(false);
  }, []);

  const exportToExcel = () => {
    if (payments.length === 0) return;
    const headers = ['Sana', 'Turi', 'Miqdor (USD)', 'Holat'];
    const rows = payments.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.type || 'To\'lov',
      `$${Number(p.amount_usd).toFixed(2)}`,
      p.status || 'Success'
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
          <button onClick={exportToExcel} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#241411', color: '#43b581', border: '1px solid #43b581', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-file-excel"></i> Excel'ga yuklash
          </button>
        </div>

        {loading && <Loading />}
        {error && <p style={{ color: '#ed5555' }}>{error}</p>}
        {!loading && payments.length === 0 && (
          <EmptyState icon="fa-receipt" title="Hali xaridlar yo'q" message="Siz hali hech qanday to'lov qilmadingiz." />
        )}
        {payments.length > 0 && (
          <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#19100e', color: '#b9a6a2', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Sana</th>
                  <th style={{ padding: '1rem' }}>Turi</th>
                  <th style={{ padding: '1rem' }}>Miqdor</th>
                  <th style={{ padding: '1rem' }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #48201a', color: '#f5eeee' }}>
                    <td style={{ padding: '1rem' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{p.type || 'To\'lov'}</td>
                    <td style={{ padding: '1rem', color: p.amount_usd > 0 ? '#43b581' : '#ed5555', fontWeight: 'bold' }}>
                      {p.amount_usd > 0 ? '+' : ''}${Number(p.amount_usd).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', color: '#43b581' }}>{p.status || 'Success'}</td>
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