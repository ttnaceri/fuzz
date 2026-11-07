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
  const [isApp, setIsApp] = useState(true); // Default: App deb hisoblaymiz (miltillashni oldini oladi)

  useEffect(() => {
    const checkApp = () => {
      // 1. Telegram ichida bo'lsa
      const isTelegram = !!window.Telegram?.WebApp;
      // 2. PWA, Fullscreen, Standalone bo'lsa
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Agar shulardan birortasi true bo'lsa, bu App!
      return isTelegram || isFullscreen || isStandalone || isMinimalUI;
    };

    setIsApp(checkApp());
    
    // Ekran o'lchamini kuzatish
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>

        {!isMobile && <Navigation />}
        <div style={{ flex: 1 }}></div>
        {!isMobile && <SearchBar />}
        
        <div className="header__actions" style={{ marginLeft: '1rem' }}>
          {!isMobile && (
            <button onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} className="btn btn-ghost btn-sm" style={{ fontWeight: 'bold' }}>
              {lang.toUpperCase()}
            </button>
          )}

          {/* DOWNLOAD FUZZ: Faqat brauzerda va App bo'lmaganda */}
          {!isMobile && !isApp && (
            <button 
              onClick={() => info("Ilovani o'rnatish uchun brauzer menyusidan foydalaning.")} 
              className="btn btn-secondary btn-sm" 
              style={{ borderColor: '#8a1200', color: '#f5eeee', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="fa-solid fa-download" style={{ color: '#8a1200' }} />
              <span>Download Fuzz</span>
            </button>
          )}

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin" : "/account"} className="btn btn-ghost btn-sm">
                <i className={isAdmin ? "fa-solid fa-shield" : "fa-solid fa-user"} /> 
                <span className="d-none d-md-inline">{isAdmin ? 'Admin' : (user?.username || 'Account')}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}