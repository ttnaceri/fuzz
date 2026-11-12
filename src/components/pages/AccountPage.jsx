import useAuth from '../hooks/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('account.title')}</h1>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p><strong>{t('account.username')}:</strong> {user?.username || user?.email || '—'}</p>
          <p style={{ marginTop: '0.5rem' }}><strong>{t('account.balance')}:</strong> ${Number(user?.balance || 0).toFixed(2)}</p>
          <button className="btn btn-secondary mt-2" onClick={logout}>{t('account.logout')}</button>
        </div>
      </div>
    </div>
  );
}