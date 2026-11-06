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
  const navigate = useNavigate();
  const { info } = useToast();
  
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

  const handleDownloadSetup = () => {
    // Fuzz Setup dasturini yuklash
    // Fayl public/FuzzSetup.exe da bo'lishi kerak
    const link = document.createElement('a');
    link.href = '/FuzzSetup.exe'; 
    link.download = 'FuzzSetup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    info("Fuzz Setup yuklab olinmoqda...");
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
          
          {/* Download Setup Tugmasi (faqat desktop uchun) */}
          {!isMobile && (
            <button 
              onClick={handleDownloadSetup} 
              className="btn btn-primary btn-sm" 
              style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}
              title="Download Fuzz for Windows"
            >
              <i className="fa-solid fa-download" /> Download
            </button>
          )}

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