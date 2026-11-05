import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState([]);
  const { success, error: toastError, info } = useToast();
  const prevRequestsRef = useRef([]);

  const loadRequests = async () => {
    try {
      const data = await api.get('/api/admin/payment-requests');
      const newRequests = data.requests || [];

      // Yangi so'rovlarni aniqlash
      const prevIds = prevRequestsRef.current.map(r => r.id);
      const newOnes = newRequests.filter(r => !prevIds.includes(r.id));

      // Bildirishnoma yuborish
      if (newOnes.length > 0) {
        newOnes.forEach(r => {
          // 1. Browser Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Yangi To\'lov So\'rovi!', {
              body: `${r.username} - ${r.amount_uzs.toLocaleString()} so'm`,
              icon: '/image/logo.png'
            });
          }
          // 2. Toast Notification
          info(`Yangi to'lov so'rovi: ${r.username} - ${r.amount_uzs.toLocaleString()} so'm`);
        });
      }

      setRequests(newRequests);
      prevRequestsRef.current = newRequests;
    } catch (err) {
      console.warn("So'rovlarni yuklashda xato");
    }
  };

  useEffect(() => {
    // Bildirishnoma uchun ruxsat so'rash
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Birinchi marta yuklash
    loadRequests();

    // Har 5 soniyada yangilash
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Tasdiqlaysizmi?")) return;
    try {
      await api.post(`/api/admin/payment-requests/${id}/approve`);
      success("Tasdiqlandi!");
      loadRequests();
    } catch (err) { toastError(err.message || "Xato"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rad etasizmi?")) return;
    try {
      await api.post(`/api/admin/payment-requests/${id}/reject`);
      success("Rad etildi!");
      loadRequests();
    } catch (err) { toastError(err.message || "Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>To'lov So'rovlari</h1>

      {/* Bildirishnoma holati */}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <div style={{ backgroundColor: 'rgba(240, 180, 77, 0.1)', border: '1px solid #f0b44d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#f0b44d' }}>
            <i className="fa-solid fa-bell"></i> Yangi so'rovlar haqida bildirishnoma olish uchun ruxsat bering.
          </div>
          <button 
            onClick={() => Notification.requestPermission()}
            style={{ backgroundColor: '#f0b44d', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Ruxsat berish
          </button>
        </div>
      )}

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
                    <button onClick={() => handleApprove(r.id)} style={{ background: 'none', border: 'none', color: '#43b581', cursor: 'pointer', marginRight: '0.5rem' }}>
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button onClick={() => handleReject(r.id)} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
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