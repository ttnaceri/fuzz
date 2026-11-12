import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: '/admin', label: 'admin.dashboard', icon: 'fa-gauge' },
  { to: '/admin/users', label: 'admin.users', icon: 'fa-users' },
  { to: '/admin/edit-user', label: 'admin.editUser', icon: 'fa-user-pen' },
  { to: '/admin/new-game', label: 'admin.addGame', icon: 'fa-plus' },
  { to: '/admin/all-games', label: 'admin.allGames', icon: 'fa-gamepad' },
  { to: '/admin/companies', label: 'admin.companies', icon: 'fa-building' },
  { to: '/admin/new-company', label: 'admin.addCompany', icon: 'fa-plus' },
  { to: '/admin/events', label: 'admin.events', icon: 'fa-calendar' },
  { to: '/admin/bundles', label: 'admin.bundles', icon: 'fa-box-open' },
  { to: '/admin/new-bundle', label: 'admin.addBundle', icon: 'fa-plus' },
  { to: '/admin/platform', label: 'admin.platformFinance', icon: 'fa-chart-line' },
  { to: '/admin/rate', label: 'admin.rates', icon: 'fa-dollar-sign' },
  { to: '/admin/stars-rate', label: 'admin.starsRate', icon: 'fa-star' },
  { to: '/admin/payments', label: 'admin.paymentMethods', icon: 'fa-credit-card' },
  { to: '/admin/payment-requests', label: 'admin.paymentRequests', icon: 'fa-list-check' },
  { to: '/admin/server', label: 'admin.serverStatus', icon: 'fa-server' },
  { to: '/admin/telegram', label: 'admin.telegramSupport', icon: 'fa-paper-plane' },
  { to: '/admin/api', label: 'admin.apiKeys', icon: 'fa-key' },
  { to: '/admin/webhooks', label: 'admin.webhooks', icon: 'fa-link' },
  { to: '/admin/backend', label: 'admin.backendServices', icon: 'fa-database' },
  { to: '/admin/roles', label: 'admin.roles', icon: 'fa-shield-halved' },
  { to: '/admin/permissions', label: 'admin.permissions', icon: 'fa-lock' },
  { to: '/admin/logs', label: 'admin.logs', icon: 'fa-scroll' },
  { to: '/admin/user-logs', label: 'admin.userLogs', icon: 'fa-history' },
  { to: '/admin/settings', label: 'admin.settings', icon: 'fa-gear' },
];

export default function AdminLayout() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#100b0a' }}>
      <aside style={{ width: '260px', backgroundColor: '#19100e', borderRight: '1px solid #48201a', padding: '1.5rem 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#8a1200', margin: 0 }}>{t('admin.adminPanel')}</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 1.5rem', color: isActive ? '#f5eeee' : '#b9a6a2',
                textDecoration: 'none', backgroundColor: isActive ? '#241411' : 'transparent',
                borderLeft: isActive ? '3px solid #8a1200' : '3px solid transparent',
                fontSize: '0.9rem',
              })}
            >
              <i className={`fa-solid ${item.icon}`} style={{ width: 16 }}></i>
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', marginTop: '1rem', borderTop: '1px solid #48201a' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>{t('auth.logout')}</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}