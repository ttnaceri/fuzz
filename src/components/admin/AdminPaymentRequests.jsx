import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState([]);
  const { success, error: toastError } = useToast();

  const loadRequests = () => {
    api.get('/api/admin/payment-requests').then(data => setRequests(data.requests || [])).catch(() => {});
  };

  useEffect(() => { loadRequests(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Tasdiqlaysizmi?")) return;
    try {
      await api.post(`/api/admin/payment-requests/${id}/approve`);
      success("Tasdiqlandi!");
      loadRequests();
    } catch { toastError("Xato"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rad etasizmi?")) return;
    try {
      await api.post(`/api/admin/payment-requests/${id}/reject`);
      success("Rad etildi!");
      loadRequests();
    } catch { toastError("Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>To'lov So'rovlari</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>Foydalanuvchi</th>
            <th style={{ padding: '1rem' }}>Miqdor (UZS)</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Sana</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#b9a6a2' }}>{r.id.substring(0, 8)}...</td>
              <td style={{ padding: '1rem' }}>{r.username}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>{r.amount_uzs.toLocaleString()} so'm</td>
              <td style={{ padding: '1rem', color: r.status === 'pending' ? '#f0b44d' : (r.status === 'approved' ? '#43b581' : '#ed5555') }}>
                {r.status === 'pending' ? 'Kutilmoqda' : (r.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan')}
              </td>
              <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ padding: '1rem' }}>
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(r.id)} style={{ background: 'none', border: 'none', color: '#43b581', cursor: 'pointer', marginRight: '0.5rem' }}><i className="fa-solid fa-check"></i></button>
                    <button onClick={() => handleReject(r.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}><i className="fa-solid fa-xmark"></i></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}