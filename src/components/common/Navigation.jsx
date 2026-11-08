import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

export default function Navigation() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [hovered, setHovered] = useState(null);

  const menuItems = [
    { path: '/', label: t('nav.home') || 'Bosh sahifa', key: 'home' },
    { path: '/store', label: t('nav.store') || "Do'kon", key: 'store' },
    { path: '/library', label: t('nav.library') || 'Kutubxona', key: 'library' },
  ];

  return (
    <nav className="nav-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      {menuItems.map((item) => (
        <div 
          key={item.key} 
          style={{ position: 'relative', padding: '1rem 0', cursor: 'pointer' }}
          onMouseEnter={() => setHovered(item.key)}
          onMouseLeave={() => setHovered(null)}
        >
          <Link to={item.path} style={{ color: '#b9a6a2', textDecoration: 'none', fontWeight: '500' }}>
            {item.label}
          </Link>
          
          {/* Home uchun maxsus submenu */}
          {item.key === 'home' && hovered === 'home' && (
            <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '6px', minWidth: '150px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <Link to="/profile" style={{ display: 'block', padding: '0.6rem 1rem', color: '#f5eeee', textDecoration: 'none', borderBottom: '1px solid #48201a' }}>Profile</Link>
              <Link to="/security" style={{ display: 'block', padding: '0.6rem 1rem', color: '#f5eeee', textDecoration: 'none' }}>Security</Link>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}