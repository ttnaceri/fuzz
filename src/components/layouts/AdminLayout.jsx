import { NavLink, Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', end: true },
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/games', label: 'Games', icon: 'fa-gamepad' },
  { to: '/admin/bundles', label: 'Bundles', icon: 'fa-box-open' },
  { to: '/admin/platform', label: 'Platform Finance', icon: 'fa-chart-line' },
  { to: '/admin/rate', label: 'Rates', icon: 'fa-money-bill-transfer' },
  { to: '/admin/server', label: 'Server Status', icon: 'fa-server' },
  { to: '/admin/telegram', label: 'Telegram & Support', icon: 'fa-paper-plane' },
  { to: '/admin/api', label: 'API Keys', icon: 'fa-key' },
  { to: '/admin/webhooks', label: 'Webhooks', icon: 'fa-webhook' },
  { to: '/admin/backend', label: 'Backend Services', icon: 'fa-database' },
  { to: '/admin/logs', label: 'Admin Logs', icon: 'fa-list' },
  { to: '/admin/user-logs', label: 'User Logs', icon: 'fa-history' },
  { to: '/admin/roles', label: 'Roles', icon: 'fa-user-shield' },
  { to: '/admin/permissions', label: 'Permissions', icon: 'fa-lock' },
];

export default function AdminLayout() {
  const { t } = useLanguage();

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#100b0a' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#19100e', borderRight: '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <Link to="/" style={{ color: '#8a1200', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2rem', textDecoration: 'none' }}>
          Fuzz Admin
        </Link>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
          {ADMIN_LINKS.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                color: isActive ? '#f5eeee' : '#b9a6a2',
                backgroundColor: isActive ? '#241411' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              })}
            >
              <i className={`fa-solid ${link.icon}`} style={{ width: '20px' }}></i>
              {link.label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Asosiy Kontent */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}