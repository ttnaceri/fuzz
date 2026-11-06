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
      {/* Burger Menu (Ochilganda) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#100b0a', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>Menyu</span>
            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', color: '#ed5555', fontSize: '2rem' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <NavLink to="/" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-house" style={{ width: '30px', color: '#8a1200' }}></i> {t('nav.home')}
            </NavLink>
            <NavLink to="/store" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-store" style={{ width: '30px', color: '#8a1200' }}></i> {t('nav.store')}
            </NavLink>
            <NavLink to="/library" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-book" style={{ width: '30px', color: '#8a1200' }}></i> {t('nav.library')}
            </NavLink>
            <NavLink to="/wallet/history" onClick={toggleMenu} style={{ color: '#f5eeee', fontSize: '1.2rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-wallet" style={{ width: '30px', color: '#8a1200' }}></i> {t('nav.wallet')}
            </NavLink>
            
            <hr style={{ borderColor: '#48201a', width: '100%', margin: '1rem 0' }} />
            
            {/* Til tanlash */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setLang('uz'); toggleMenu(); }} style={{ background: lang === 'uz' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>UZ</button>
              <button onClick={() => { setLang('ru'); toggleMenu(); }} style={{ background: lang === 'ru' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>RU</button>
              <button onClick={() => { setLang('en'); toggleMenu(); }} style={{ background: lang === 'en' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>EN</button>
            </div>
          </div>
        </div>
      )}

      {/* Pastki Navigatsiya Panelи */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-gamepad"></i>
          <span>Games</span>
        </NavLink>

        <NavLink to="/library" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-book"></i>
          <span>Library</span>
        </NavLink>

        {/* Markaziy QR Skaner tugmasi */}
        <div className="bottom-nav__center">
          <button onClick={() => navigate('/qr-scan')} className="bottom-nav__qr-btn" aria-label="QR Login">
            <i className="fa-solid fa-qrcode"></i>
          </button>
        </div>

        <NavLink to="/account" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-user"></i>
          <span>Profil</span>
        </NavLink>

        {/* Burger tugmasi */}
        <button onClick={toggleMenu} className="bottom-nav__item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <i className="fa-solid fa-bars"></i>
          <span>Menyu</span>
        </button>
      </nav>
    </>
  );
}