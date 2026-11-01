import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function BottomNav() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Burger Menu Overlay */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <button onClick={toggleMenu} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#fff', fontSize: '2rem' }}>&times;</button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            <NavLink to="/" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>{t('nav.home')}</NavLink>
            <NavLink to="/store" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>{t('nav.store')}</NavLink>
            <NavLink to="/library" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>{t('nav.library')}</NavLink>
            <NavLink to="/wallet/history" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>{t('nav.wallet')}</NavLink>
            
            <hr style={{ borderColor: '#48201a', width: '100%' }} />
            
            {/* Language Switcher for Mobile */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setLang('uz'); toggleMenu(); }} style={{ background: 'none', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px' }}>UZ</button>
              <button onClick={() => { setLang('ru'); toggleMenu(); }} style={{ background: 'none', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px' }}>RU</button>
              <button onClick={() => { setLang('en'); toggleMenu(); }} style={{ background: 'none', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px' }}>EN</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-gamepad"></i>
          <span>Games</span>
        </NavLink>

        <NavLink to="/library" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-book"></i>
          <span>Library</span>
        </NavLink>

        {/* Center QR Scan Button (Mobile Only) */}
        <div className="bottom-nav__center">
          <button onClick={() => navigate('/login?mobileScan=true')} className="bottom-nav__qr-btn" aria-label="QR Login">
            <i className="fa-solid fa-qrcode"></i>
          </button>
        </div>

        <NavLink to="/account" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-user"></i>
          <span>Profile</span>
        </NavLink>

        {/* Burger Menu Button */}
        <button onClick={toggleMenu} className="bottom-nav__item" style={{ background: 'none', border: 'none' }}>
          <i className="fa-solid fa-bars"></i>
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}