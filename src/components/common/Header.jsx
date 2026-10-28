import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';
import useToast from '../hooks/useToast.js';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { info } = useToast();
  const [lang, setLang] = useState('UZ');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // PWA Install funksiyasini ushlab qolish
  useEffect(() => {
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
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      info("Ilovani o'rnatish uchun brauzeringiz menyusidan 'Add to Home Screen' ni tanlang.");
    }
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>
        <Navigation />
        <SearchBar />
        
        <div className="header__actions">
          {/* App Install Tugmasi */}
          <button 
            onClick={handleInstallApp} 
            className="btn btn-secondary btn-sm d-none d-sm-flex" 
            title="Install App"
          >
            <i className="fa-solid fa-download" /> <span className="d-none d-md-inline">App Install</span>
          </button>

          <button 
            onClick={() => setLang((prev) => (prev === 'UZ' ? 'EN' : 'UZ'))} 
            className="btn btn-ghost btn-sm" 
            style={{ fontWeight: 'bold' }}
          >
            {lang}
          </button>

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/account" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-user" /> <span className="d-none d-md-inline">{user?.username || 'Account'}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}