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
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isApp, setIsApp] = useState(true); // Default: App deb hisoblaymiz (xavfsizroq)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);

    // ============ ILOVA (APP) ANIQLASH ============
    const checkIfApp = () => {
      // 1. Telegram WebApp (eng ishonchli usul - obyektning o'zi borligi)
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      const isTelegram = !!tg;

      // 2. PWA standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // 3. iOS Safari standalone
      const isIOSStandalone = window.navigator.standalone === true;

      // Agar shulardan biri bo'lsa - bu App
      return isTelegram || isStandalone || isIOSStandalone;
    };

    // Bir necha marta tekshirish (Telegram kech yuklanishi mumkin)
    // 0ms, 300ms, 1000ms da tekshiramiz
    setIsApp(checkIfApp());
    const t1 = setTimeout(() => setIsApp(checkIfApp()), 300);
    const t2 = setTimeout(() => setIsApp(checkIfApp()), 1000);

    // PWA o'rnatish prompt (faqat brauzerda ishlaydi)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      info("Ilovani o'rnatish uchun brauzer menyusidan 'Add to Home Screen' ni tanlang.");
    }
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
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')}
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: 'bold' }}
            >
              {lang.toUpperCase()}
            </button>
          )}

          {/* DOWNLOAD FUZZ: faqat oddiy brauzerda ko'rinadi */}
          {!isMobile && !isApp && (
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
              title="Install Fuzz App"
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