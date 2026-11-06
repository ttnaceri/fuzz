import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fuzz App yuklab olish tugmasi uchun funksiya
  const handleDownloadApp = () => {
    // Hozircha o'rnatish oynasini chiqarish yoki yuklash sahifasiga o'tish
    // Kelajakda bu yerga .exe, .dmg yoki PWA o'rnatish logikasi ulanadi
    navigate('/download'); 
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
          
          {/* Til o'zgartirish (faqat desktopda) */}
          {!isMobile && (
            <button 
              onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} 
              className="btn btn-ghost btn-sm" 
              style={{ fontWeight: 'bold' }}
            >
              {lang.toUpperCase()}
            </button>
          )}

          {/* DOWNLOAD FUZZ TUGMASI (faqat desktop va netbuklar uchun) */}
          {!isMobile && (
            <button 
              onClick={handleDownloadApp} 
              className="btn btn-secondary btn-sm" 
              style={{ 
                borderColor: '#8a1200', 
                color: '#f5eeee',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Download Fuzz App"
            >
              <i className="fa-solid fa-download" style={{ color: '#8a1200' }} />
              <span>Download Fuzz</span>
            </button>
          )}

          {/* Savat */}
          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {/* Profil / Login */}
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