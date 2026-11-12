import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useLanguage } from '../context/useLanguage.js';
import Sidebar from '../common/Sidebar.jsx';

export default function AccountPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="with-sidebar">
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 className="page-title">{t('account.title')}</h1>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{t('account.balance')}</div>
              <div style={{ color: '#43b581', fontSize: '1.5rem', fontWeight: 'bold' }}>${user?.balance?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <div style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{t('account.username')}</div>
              <div style={{ color: '#f5eeee', fontSize: '1rem' }}>{user?.username || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{t('account.email')}</div>
              <div style={{ color: '#f5eeee', fontSize: '1rem' }}>{user?.email || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{t('account.role')}</div>
              <div style={{ color: '#f5eeee', fontSize: '1rem', textTransform: 'capitalize' }}>{user?.role || 'user'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-secondary">{t('account.editProfile')}</Link>
          <Link to="/security" className="btn btn-secondary">{t('account.security')}</Link>
          <Link to="/wallet/history" className="btn btn-secondary">{t('wallet.history')}</Link>
        </div>
      </div>
    </div>
  );
}