import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import AdminConsole from '../admin/AdminConsole.jsx';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', end: true },
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/edit-user', label: 'Edit User', icon: 'fa-user-pen' }, // YANGI
  { to: '/admin/new-game', label: 'Add Game', icon: 'fa-plus' },
  { to: '/admin/all-games', label: 'All Games', icon: 'fa-gamepad' },
  { to: '/admin/companies', label: 'Companies', icon: 'fa-building' },
  { to: '/admin/new-company', label: 'Add Company', icon: 'fa-plus-square' },
  { to: '/admin/events', label: 'Events', icon: 'fa-calendar' },
  { to: '/admin/bundles', label: 'Bundles', icon: 'fa-box-open' },
  { to: '/admin/platform', label: 'Platform Finance', icon: 'fa-chart-line' },
  { to: '/admin/rate', label: 'Rates', icon: 'fa-money-bill-transfer' },
  { to: '/admin/stars-rate', label: 'Stars Rate', icon: 'fa-star' },
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
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };
    const handleClick = () => setContextMenu(null);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#100b0a' }}>
      <aside style={{ width: '260px', backgroundColor: '#19100e', borderRight: '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Link to="/" style={{ color: '#8a1200', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2rem', textDecoration: 'none' }}>
          Fuzz Admin
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
      <AdminConsole />
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '6px', zIndex: 99999, padding: '0.5rem 0', width: '200px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <div onClick={() => navigate('/admin')} style={{ padding: '0.5rem 1rem', color: '#f5eeee', cursor: 'pointer', fontSize: '0.9rem' }}>Dashboard</div>
          <div onClick={() => navigate('/admin/companies')} style={{ padding: '0.5rem 1rem', color: '#f5eeee', cursor: 'pointer', fontSize: '0.9rem' }}>Companies</div>
          <div onClick={() => navigate('/admin/all-games')} style={{ padding: '0.5rem 1rem', color: '#f5eeee', cursor: 'pointer', fontSize: '0.9rem' }}>Games</div>
          <div onClick={() => navigate('/admin/events')} style={{ padding: '0.5rem 1rem', color: '#f5eeee', cursor: 'pointer', fontSize: '0.9rem' }}>Events</div>
        </div>
      )}
    </div>
  );
}