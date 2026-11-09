import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import useToast from '../hooks/useToast.js';

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const modalInputRef = useRef(null);
  const { success, error: toastError, info } = useToast();
  const prevRequestsRef = useRef([]);

  const loadRequests = async () => {
    try {
      const data = await api.get('/api/admin/payment-requests');
      const newRequests = data.requests || [];
      const prevIds = prevRequestsRef.current.map(r => r.id);
      const newOnes = newRequests.filter(r => !prevIds.includes(r.id));
      if (newOnes.length > 0) {
        newOnes.forEach(r => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Yangi To\'lov So\'rovi!', {
              body: `${r.username} - ${r.amount_uzs.toLocaleString()} so'm`,
              icon: '/image/logo.png'
            });
          }
          info(`Yangi to'lov so'rovi: ${r.username}`);
        });
      }
      setRequests(newRequests);
      prevRequestsRef.current = newRequests;
    } catch (err) { console.warn("So'rovlarni yuklashda xato"); }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!modalAction) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handleBulkAction(modalAction); }
      if (e.key === 'Escape') setModalAction(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    if (modalInputRef.current) modalInputRef.current.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAction, selectedIds]);

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filteredRequests = requests.filter(r => r.username.toLowerCase().includes(search.toLowerCase()));

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) setSelectedIds([]);
    else setSelectedIds(filteredRequests.map(r => r.id));
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) { toastError("Hech qanday so'rov tanlanmagan!"); return; }
    try {
      if (action === 'approve') {
        // YANGI BACKEND FORMATI: { ids: [...] } → POST /api/admin/payment-requests/approve
        await api.post('/api/admin/payment-requests/approve', { ids: selectedIds });
        success(`${selectedIds.length} ta so'rov tasdiqlandi!`);
      } else {
        await api.post('/api/admin/payment-requests/reject', { ids: selectedIds });
        success(`${selectedIds.length} ta so'rov rad etildi!`);
      }
      setSelectedIds([]);
      setModalAction(null);
      loadRequests();
    } catch (err) { toastError(err.message || "Xato"); }
  };

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>To'lov So'rovlari</h1>

      {'Notification' in window && Notification.permission !== 'granted' && (
        <div style={{ backgroundColor: 'rgba(240, 180, 77, 0.1)', border: '1px solid #f0b44d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#f0b44d' }}>
            <i className="fa-solid fa-bell"></i> Yangi so'rovlar haqida bildirishnoma olish uchun ruxsat bering.
          </div>
          <button onClick={() => Notification.requestPermission()} style={{ backgroundColor: '#f0b44d', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Ruxsat berish
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Foydalanuvchi nomi bo'yicha qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        {selectedIds.length > 0 && (
          <>
            <button onClick={() => setModalAction('approve')} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#43b581', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              <i className="fa-solid fa-check"></i> Tanlanganlarni tasdiqlash ({selectedIds.length})
            </button>
            <button onClick={() => setModalAction('reject')} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#ed5555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              <i className="fa-solid fa-xmark"></i> Tanlanganlarni rad etish ({selectedIds.length})
            </button>
          </>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem', width: '40px' }}>
              <input type="checkbox" checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length} onChange={toggleSelectAll} style={{ accentColor: '#8a1200', cursor: 'pointer' }} />
            </th>
            <th style={{ padding: '1rem' }}>Foydalanuvchi</th>
            <th style={{ padding: '1rem' }}>Miqdor (UZS)</th>
            <th style={{ padding: '1rem' }}>Sana</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem' }}>
                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} style={{ accentColor: '#8a1200', cursor: 'pointer' }} />
              </td>
              <td style={{ padding: '1rem' }}>{r.username}</td>
              <td style={{ padding: '1rem', color: '#43b581' }}>{r.amount_uzs.toLocaleString()} so'm</td>
              <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ padding: '1rem' }}>
                <button onClick={() => { setSelectedIds([r.id]); setModalAction('approve'); }} style={{ background: 'none', border: 'none', color: '#43b581', cursor: 'pointer', marginRight: '0.5rem' }} title="Tasdiqlash">
                  <i className="fa-solid fa-check"></i>
                </button>
                <button onClick={() => { setSelectedIds([r.id]); setModalAction('reject'); }} style={{ background: 'none', border: 'none', color: '#ed5555', cursor: 'pointer' }} title="Rad etish">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div ref={modalInputRef} tabIndex={-1} style={{ backgroundColor: '#241411', padding: '2rem', borderRadius: '8px', border: '1px solid #48201a', width: '400px', outline: 'none' }}>
            <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>
              {modalAction === 'approve' ? 'Tasdiqlashni tasdiqlang' : 'Rad etishni tasdiqlang'}
            </h3>
            <p style={{ color: '#b9a6a2', marginBottom: '1.5rem' }}>
              Siz {selectedIds.length} ta so'rovni {modalAction === 'approve' ? 'tasdiqlamoqchisiz' : 'rad etmoqchisiz'}.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleBulkAction(modalAction)}
                style={{ flex: 1, padding: '0.8rem', backgroundColor: modalAction === 'approve' ? '#43b581' : '#ed5555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {modalAction === 'approve' ? 'Tasdiqlash' : 'Rad etish'}
              </button>
              <button onClick={() => setModalAction(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#48201a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Bekor qilish (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}