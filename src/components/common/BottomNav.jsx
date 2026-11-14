import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function BottomNav() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const checkApp = () => {
      if (typeof window === 'undefined') return false;
      const isMobileScreen = window.innerWidth <= 1024;
      if (!isMobileScreen) return false; 

      const isTelegram = !!window.Telegram?.WebApp;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      return isTelegram || isFullscreen || isStandalone || isMinimalUI;
    };

    setIsApp(checkApp());
    const handleResize = () => setIsApp(checkApp());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (!isApp) return null;

  const handleNewsClick = () => {
    window.open('https://t.me/updateDevNews', '_blank', 'noopener,noreferrer');
    toggleMenu();
  };

  // Yangilangan menyu ro'yxati
  const menuItems = [
    { name: t('nav.store'), icon: 'fa-gamepad', path: '/store' },
    { name: t('nav.news'), icon: 'fa-newspaper', action: handleNewsClick },
    { name: t('settings.title'), icon: 'fa-gear', path: '/settings' },
    { name: t('nav.library'), icon: 'fa-book', path: '/library' },
    // Hamyon o'rniga 3 ta yangi tugma:
    { name: t('wallet.topUp'), icon: 'fa-plus-circle', path: '/wallet/topup' },
    { name: t('wallet.history'), icon: 'fa-list', path: '/wallet/history' },
    { name: t('wallet.refund'), icon: 'fa-rotate-left', path: '/wallet/refund' },
    
    { name: t('wishlist.title'), icon: 'fa-heart', path: '/wishlist' },
  ];

  return (
    <>
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: '64px',
          backgroundColor: '#100b0a',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>{t('nav.menu')}</span>
            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', color: '#ed5555', fontSize: '2rem', cursor: 'pointer' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* 1 USTUNLI GRID (Har bir tugma 1 qator) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path);
                    toggleMenu();
                  }
                }}
                style={{
                  backgroundColor: '#241411',
                  border: '1px solid #48201a',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center', // Matn va ikonka yonma-yon
                  gap: '1rem',
                  color: '#f5eeee',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.5rem', color: '#8a1200', width: '30px', textAlign: 'center' }}></i>
                <span style={{ fontSize: '1rem' }}>{item.name}</span>
              </button>
            ))}
          </div>

          <hr style={{ borderColor: '#48201a', width: '100%', margin: '2rem 0' }} />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setLang('uz')} style={{ flex: 1, background: lang === 'uz' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>UZ</button>
            <button onClick={() => setLang('ru')} style={{ flex: 1, background: lang === 'ru' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>RU</button>
            <button onClick={() => setLang('en')} style={{ flex: 1, background: lang === 'en' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>EN</button>
          </div>
        </div>
      )}

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#19100e',
        borderTop: '1px solid #48201a',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 9999,
        height: '64px',
      }}>
        <NavLink to="/" style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%'
        })}>
          <i className="fa-solid fa-house" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.home')}</span>
        </NavLink>

        <NavLink to="/store" style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%'
        })}>
          <i className="fa-solid fa-gamepad" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.store')}</span>
        </NavLink>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/qr-scan')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#8a1200',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              border: 'none',
            }}
            aria-label={t('nav.qrLogin')}
          >
            <i className="fa-solid fa-qrcode" style={{ fontSize: '1.3rem' }}></i>
          </button>
        </div>

        <NavLink to="/account" style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%'
        })}>
          <i className="fa-solid fa-user" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.profile')}</span>
        </NavLink>

        <button onClick={toggleMenu} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: isMenuOpen ? '#f5eeee' : '#b9a6a2', fontSize: '0.75rem', flex: 1, height: '100%'
        }}>
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`} style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.menu')}</span>
        </button>
      </nav>
    </>
  );
}