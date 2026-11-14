import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';
import useToast from '../hooks/useToast.js';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const { info } = useToast();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isApp, setIsApp] = useState(true);

  useEffect(() => {
    const checkApp = () => {
      const isTelegram = !!window.Telegram?.WebApp;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      return isTelegram || isFullscreen || isStandalone || isMinimalUI;
    };

    setIsApp(checkApp());

    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mobil menyuni ochish uchun (Steam'dagi kabi)
  const handleOpenMobileMenu = () => {
    // Pastdagi BottomNav dagi Burger tugmasini bosish effektini berish
    const menuBtn = document.querySelector('.bottom-nav__menu-trigger');
    if (menuBtn) menuBtn.click();
  };

  return (
    <header className="header">
      <div className="container header__inner" style={{ gap: '1rem' }}>
        
        {/* Logo */}
        <Link to="/" className="header__brand" style={{ flexShrink: 0 }}>
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>

        {!isMobile && <Navigation />}
        
        <div style={{ flex: 1 }}></div>
        
        {!isMobile && <SearchBar />}

        <div className="header__actions" style={{ marginLeft: '1rem', flexShrink: 0 }}>
          {!isMobile && (
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')}
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: 'bold' }}
            >
              {lang.toUpperCase()}
            </button>
          )}

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/account'} className="btn btn-ghost btn-sm">
                <i className={isAdmin ? 'fa-solid fa-shield' : 'fa-solid fa-user'} />
                <span className="d-none d-md-inline">
                  {isAdmin ? t('auth.admin') : (user?.username || t('auth.account'))}
                </span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title={t('auth.logout')}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>
          )}
        </div>
      </div>

      {/* Steam uslubidagi Mobil gorizontal menyu */}
      {isMobile && isAuthenticated && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '2rem', 
          padding: '0.5rem 1rem', 
          borderTop: '1px solid #48201a',
          backgroundColor: '#19100e'
        }}>
          <button 
            onClick={handleOpenMobileMenu} 
            style={{ background: 'none', border: 'none', color: '#f5eeee', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            {t('nav.menu')} <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
          </button>
          
          <Link to="/wishlist" style={{ color: '#f5eeee', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {t('wishlist.title') || 'WISHLIST'}
          </Link>
          
          <Link to="/wallet/history" style={{ color: '#f5eeee', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {t('nav.wallet') || 'WALLET'}
          </Link>
        </div>
      )}
    </header>
  );
}