import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/store', label: 'Store' },
  { to: '/new-releases', label: 'New' },
  { to: '/special-offers', label: 'Offers' },
  { to: '/free-games', label: 'Free' },
  { to: '/library', label: 'Library' },
];

export default function Navigation() {
  return (
    <nav className="header__nav">
      {LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}