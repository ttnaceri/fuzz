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
  
  // Netbuk va mobil uchun 1024px chegarasi
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  
  // PWA O'rnatish (Download Fuzz) uchun state'lar
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PWA Install logikasini ushlab qolish
  useEffect(() => {
    // 1. Agar ilova allaqachon o'rnatilgan bo'lsa (standalone rejimda ochilgan bo'lsa)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // 2. Brauzer o'rnatish oynasini tayyorlaganda ushlab qolish
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. O'rnatish tugallanganda state'ni yangilash
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      info("Fuzz muvaffaqiyatli o'rnatildi!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [info]);

  // "Download Fuzz" tugmasi bosilganda
  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      // Brauzerning o'rnatish oynasini ko'rsatish
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Foydalanuvchi ilovani o\'rnatishni tanladi');
      }
      setDeferredPrompt(null);
    } else {
      // Agar brauzer beforeinstallprompt'ni qo'llab-quvvatlamasa
      info("Ilovani o'rnatish uchun brauzer menyusidan 'Add to Home Screen' (Bosh ekranga qo'shish) ni tanlang.");
    }
  };

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
          
          {/* DOWNLOAD FUZZ TUGMASI */}
          {!isInstalled && (
            <button 
              onClick={handleDownloadApp} 
              className="btn btn-primary btn-sm d-none d-md-flex" 
              style={{ 
                marginRight: '0.5rem', 
                gap: '0.4rem',
                background: 'linear-gradient(90deg, #43b581 0%, #2e7d57 100%)', // Yashilroq qilib ajralib turishi uchun
                borderColor: '#43b581'
              }}
              title="Download Fuzz App"
            >
              <i className="fa-solid fa-download" /> 
              <span>Download Fuzz</span>
            </button>
          )}

          {/* Til o'zgartirish */}
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