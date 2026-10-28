import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function Navigation() {
  const { t } = useLanguage();

  const LINKS = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/store', label: t('nav.store') },
    { to: '/new-releases', label: t('nav.new') },
    { to: '/special-offers', label: t('nav.offers') },
    { to: '/free-games', label: t('nav.free') },
    { to: '/library', label: t('nav.library') },
  ];

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