import { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar.jsx';

export default function WalletHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('fuzz_wallet_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      const initial = [
        { date: '2026-10-28', type: 'Top Up', amount: '+50,000 UZS', status: 'Success' },
        { date: '2026-10-29', type: 'Purchase (Game)', amount: '-$0.11', status: 'Success' },
      ];
      setHistory(initial);
      localStorage.setItem('fuzz_wallet_history', JSON.stringify(initial));
    }
  }, []);

  const exportToExcel = () => {
    if (history.length === 0) return;
    const headers = ['Sana', 'Turi', 'Miqdor', 'Holat'];
    const rows = history.map(h => [h.date, h.type, h.amount, h.status].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fuzz_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title">Mening tarixim</h1>
          <button onClick={exportToExcel} style={{ backgroundColor: '#241411', color: '#43b581', border: '1px solid #43b581', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-file-excel"></i> Excel'ga yuklash
          </button>
        </div>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#19100e', color: '#b9a6a2', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <tr><th style={{ padding: '1rem' }}>Sana</th><th style={{ padding: '1rem' }}>Turi</th><th style={{ padding: '1rem' }}>Miqdor</th><th style={{ padding: '1rem' }}>Holat</th></tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderTop: '1px solid #48201a' }}>
                  <td style={{ padding: '1rem', color: '#f5eeee' }}>{h.date}</td>
                  <td style={{ padding: '1rem', color: '#f5eeee' }}>{h.type}</td>
                  <td style={{ padding: '1rem', color: h.amount.startsWith('+') ? '#43b581' : '#ed5555', fontWeight: 'bold' }}>{h.amount}</td>
                  <td style={{ padding: '1rem', color: '#43b581' }}>{h.status}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#b9a6a2' }}>Tarix bo'sh</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}