import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/account', label: 'Account', icon: 'fa-user' },
  { to: '/profile', label: 'Profile', icon: 'fa-id-card' },
  { to: '/library', label: 'Library', icon: 'fa-book' },
  { to: '/downloads', label: 'Downloads', icon: 'fa-download' },
  { to: '/wishlist', label: 'Wishlist', icon: 'fa-heart' },
  { to: '/cart', label: 'Cart', icon: 'fa-cart-shopping' },
  { to: '/purchases', label: 'Purchases', icon: 'fa-receipt' },
  { to: '/settings', label: 'Settings', icon: 'fa-gear' },
  { to: '/security', label: 'Security', icon: 'fa-shield-halved' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>
          <i className={`fa-solid ${l.icon}`} /> {l.label}
        </NavLink>
      ))}
    </aside>
  );
}