import { NavLink, Outlet, Link } from 'react-router-dom';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', end: true },
  { to: '/admin/games', label: 'Games', icon: 'fa-gamepad' },
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/orders', label: 'Orders', icon: 'fa-receipt' },
  { to: '/admin/reports', label: 'Reports', icon: 'fa-flag' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'fa-star' },
  { to: '/admin/categories', label: 'Categories', icon: 'fa-tags' },
  { to: '/admin/settings', label: 'Settings', icon: 'fa-gear' },
  { to: '/admin/logs', label: 'Logs', icon: 'fa-list' },
  { to: '/admin/roles', label: 'Roles', icon: 'fa-key' }, // Yangi qo'shildi
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <Link to="/" className="header__brand" style={{ padding: '0 0.5rem 1rem', fontSize: '1.1rem' }}>
          <span>Fuzz Admin</span>
        </Link>
        {ADMIN_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <i className={`fa-solid ${l.icon}`} /> {l.label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <Link to="/" className="text-muted" style={{ fontSize: '0.85rem' }}>
            ← Back to store
          </Link>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}