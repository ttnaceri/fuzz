import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function BottomNav() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dastlabki holat: Faqat App ichida bo'lsa ko'rinadi
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const checkApp = () => {
      if (typeof window === 'undefined') return false;
      const isTelegram = !!window.Telegram?.WebApp;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      return isTelegram || isFullscreen || isStandalone || isMinimalUI;
    };

    setIsApp(checkApp());
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // AGAR APP BO'LMASA (Web sayt yoki oddiy brauzer) - HECH NARSA KO'RSATMAYMIZ
  if (!isApp) return null;

  const handleNewsClick = () => {
    window.open('https://t.me/updateDevNews', '_blank', 'noopener,noreferrer');
    toggleMenu();
  };

  // Menyu ichidagi sahifalar
  const menuItems = [
    { name: t('nav.store'), icon: 'fa-gamepad', path: '/store' },
    { name: t('nav.news'), icon: 'fa-newspaper', action: handleNewsClick }, // Telegram havolasi
    { name: t('settings.title'), icon: 'fa-gear', path: '/settings' },
    { name: t('nav.library'), icon: 'fa-book', path: '/library' },
    { name: t('nav.wallet'), icon: 'fa-wallet', path: '/wallet/history' },
    { name: t('nav.wishlist') || 'Wishlist', icon: 'fa-heart', path: '/wishlist' },
  ];

  return (
    <>
      {/* Burger Menu (Ochilganda) */}
      {isMenuOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: '#100b0a', 
          zIndex: 9999, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '2rem' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>{t('nav.menu')}</span>
            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', color: '#ed5555', fontSize: '2rem' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          {/* Menyu elementlari (Grid ko'rinishida) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: '#f5eeee',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.5rem', color: '#8a1200' }}></i>
                <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
              </button>
            ))}
          </div>
          
          <hr style={{ borderColor: '#48201a', width: '100%', margin: '2rem 0' }} />
          
          {/* Til tanlash */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setLang('uz')} style={{ flex: 1, background: lang === 'uz' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>UZ</button>
            <button onClick={() => setLang('ru')} style={{ flex: 1, background: lang === 'ru' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>RU</button>
            <button onClick={() => setLang('en')} flex={1} style={{ flex: 1, background: lang === 'en' ? '#8a1200' : '#241411', border: '1px solid #48201a', color: '#fff', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>EN</button>
          </div>
        </div>
      )}

      {/* Pastki Navigatsiya Paneli */}
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
        zIndex: 9000,
        height: '64px',
      }}>
        
        {/* 1. HOME */}
        <NavLink to="/" style={({ isActive }) => ({ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%' 
        })}>
          <i className="fa-solid fa-house" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.home')}</span>
        </NavLink>

        {/* 2. GAMES */}
        <NavLink to="/store" style={({ isActive }) => ({ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%' 
        })}>
          <i className="fa-solid fa-gamepad" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.store')}</span>
        </NavLink>

        {/* 3. QR SCANNER (Markazda) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <button
            onClick={() => navigate('/qr-scan')}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#8a1200',
              color: '#fff',
              border: '4px solid #19100e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '-20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              cursor: 'pointer',
            }}
            aria-label={t('nav.qrLogin')}
          >
            <i className="fa-solid fa-qrcode" style={{ fontSize: '1.5rem' }}></i>
          </button>
        </div>

        {/* 4. PROFILE */}
        <NavLink to="/account" style={({ isActive }) => ({ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          color: isActive ? '#f5eeee' : '#b9a6a2', textDecoration: 'none', fontSize: '0.75rem', flex: 1, height: '100%' 
        })}>
          <i className="fa-solid fa-user" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.profile')}</span>
        </NavLink>

        {/* 5. MENU */}
        <button onClick={toggleMenu} style={{ 
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', color: '#b9a6a2', fontSize: '0.75rem', flex: 1, height: '100%' 
        }}>
          <i className="fa-solid fa-bars" style={{ fontSize: '1.2rem', marginBottom: '4px' }}></i>
          <span>{t('nav.menu')}</span>
        </button>
      </nav>
    </>
  );
}