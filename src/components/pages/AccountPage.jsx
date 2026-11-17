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

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#8a1200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
            </div>
            <div>
              <h2 style={{ color: '#f5eeee', margin: 0 }}>{user?.username || 'User'}</h2>
              <p style={{ color: '#b9a6a2', fontSize: '0.85rem', margin: 0 }}>{user?.email || '—'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div>
              <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{t('account.balance')}</p>
              <p style={{ color: '#43b581', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                ${Number(user?.balance || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{t('account.role')}</p>
              <p style={{ color: user?.role === 'admin' ? '#43b581' : '#f5eeee', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                {user?.role || 'user'}
              </p>
            </div>
          </div>

          <button className="btn btn-secondary mt-2" onClick={logout} style={{ marginTop: '1.5rem' }}>
            {t('account.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}