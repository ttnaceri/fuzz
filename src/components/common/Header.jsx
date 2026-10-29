import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';
import useToast from '../hooks/useToast.js';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const { t } = useLanguage();
  const { info } = useToast();
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData;
    const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isTelegram && !isStandalone) {
      setShowInstall(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      info("Brauzer menyusidan 'Add to Home Screen' ni tanlang.");
    }
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" style={{ whiteSpace: 'nowrap' }}>
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>
        
        <Navigation />
        
        <div style={{ flex: 1, minWidth: '20px' }}></div>

        <SearchBar />
        
        <div className="header__actions" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
          
          {showInstall && (
            <button onClick={handleInstallApp} className="btn btn-secondary btn-sm" title="Install App" style={{ marginRight: '0.5rem' }}>
              <i className="fa-solid fa-download" />
            </button>
          )}

          <Link to="/cart" className="header__icon-btn" style={{ position: 'relative' }}>
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/account" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-user" />
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>{t('auth.login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}