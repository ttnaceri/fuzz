import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import AdminConsole from '../admin/AdminConsole.jsx';

export default function AdminLayout() {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Admin linklar — tarjima kalitlari bilan
  const ADMIN_LINKS = [
    { to: '/admin', labelKey: 'admin.dashboard', icon: 'fa-gauge', end: true },
    { to: '/admin/users', labelKey: 'admin.users', icon: 'fa-users' },
    { to: '/admin/new-user', labelKey: 'admin.addUser', icon: 'fa-user-plus' },
    { to: '/admin/edit-user', labelKey: 'admin.editUser', icon: 'fa-user-pen' },
    { to: '/admin', labelKey: 'admin.dashboard', icon: 'fa-gauge', end: true },
    { to: '/admin/users', labelKey: 'admin.users', icon: 'fa-users' },
    { to: '/admin/edit-user', labelKey: 'admin.editUser', icon: 'fa-user-pen' },
    { to: '/admin/new-game', labelKey: 'admin.addGame', icon: 'fa-plus' },
    { to: '/admin/all-games', labelKey: 'admin.allGames', icon: 'fa-gamepad' },
    { to: '/admin/companies', labelKey: 'admin.companies', icon: 'fa-building' },
    { to: '/admin/new-company', labelKey: 'admin.addCompany', icon: 'fa-plus-square' },
    { to: '/admin/events', labelKey: 'admin.events', icon: 'fa-calendar' },
    { to: '/admin/bundles', labelKey: 'admin.bundles', icon: 'fa-box-open' },
    { to: '/admin/platform', labelKey: 'admin.platformFinance', icon: 'fa-chart-line' },
    { to: '/admin/rate', labelKey: 'admin.rates', icon: 'fa-money-bill-transfer' },
    { to: '/admin/stars-rate', labelKey: 'admin.starsRate', icon: 'fa-star' },
    { to: '/admin/payments', labelKey: 'admin.paymentMethods', icon: 'fa-credit-card' },
    { to: '/admin/payment-requests', labelKey: 'admin.paymentRequests', icon: 'fa-money-check' },
    { to: '/admin/server', labelKey: 'admin.serverStatus', icon: 'fa-server' },
    { to: '/admin/telegram', labelKey: 'admin.telegramSupport', icon: 'fa-paper-plane' },
    { to: '/admin/api', labelKey: 'admin.apiKeys', icon: 'fa-key' },
    { to: '/admin/webhooks', labelKey: 'admin.webhooks', icon: 'fa-link' },
    { to: '/admin/backend', labelKey: 'admin.backendServices', icon: 'fa-database' },
    { to: '/admin/logs', labelKey: 'admin.logs', icon: 'fa-list' },
    { to: '/admin/user-logs', labelKey: 'admin.userLogs', icon: 'fa-history' },
    { to: '/admin/roles', labelKey: 'admin.roles', icon: 'fa-user-shield' },
    { to: '/admin/permissions', labelKey: 'admin.permissions', icon: 'fa-lock' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#100b0a', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* Mobil burger tugmasi */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#19100e', borderBottom: '1px solid #48201a' }}>
          <Link to="/" style={{ color: '#8a1200', fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none' }}>
            Fuzz Admin
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#f5eeee', fontSize: '1.5rem' }}
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      )}

      {/* Sidebar */}
      {(!isMobile || isMobileMenuOpen) && (
        <aside style={{ width: isMobile ? '100%' : '260px', backgroundColor: '#19100e', borderRight: isMobile ? 'none' : '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: isMobile ? '50vh' : '100vh' }}>
          {!isMobile && (
            <Link to="/" style={{ color: '#8a1200', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2rem', textDecoration: 'none' }}>
              Fuzz Admin
            </Link>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {ADMIN_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
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
                  fontWeight: '500',
                })}
              >
                <i className={`fa-solid ${link.icon}`} style={{ width: '20px' }}></i>
                {t(link.labelKey)}
              </NavLink>
            ))}
          </div>
        </aside>
      )}

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
      <AdminConsole />
    </div>
  );
}