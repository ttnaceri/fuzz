import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';

export default function WalletHistoryPage() {
  const { t } = useLanguage();

  // Demo ma'lumotlar (keyinchalik API'dan olinadi)
  const historyData = [
    { id: 1, date: '2026-10-28', type: 'Top Up', amount: '+50,000 UZS', status: 'Success' },
    { id: 2, date: '2026-10-29', type: 'Purchase (Game)', amount: '-$0.11', status: 'Success' },
  ];

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('wallet.history')}</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sana</th>
              <th>Turi</th>
              <th>Miqdor</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.type}</td>
                <td style={{ color: row.amount.startsWith('+') ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 'bold' }}>
                  {row.amount}
                </td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}