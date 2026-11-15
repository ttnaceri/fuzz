import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';
import useToast from '../hooks/useToast.js';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout, signOut, switchAccount, getSavedAccounts } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const { info } = useToast();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isApp, setIsApp] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const menuRef = useRef(null);

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

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Menyu ochilganda saqlangan akkauntlarni yuklash
  useEffect(() => {
    if (isMenuOpen) {
      setSavedAccounts(getSavedAccounts() || []);
    }
  }, [isMenuOpen, getSavedAccounts]);

  const handleSwitchAccount = (account) => {
    switchAccount(account.user, account.token);
    setIsMenuOpen(false);
    // Agar admin bo'lsa adminga, user bo'lsa accountga
    navigate(account.user.role === 'admin' || account.user.role === 'super_admin' ? '/admin' : '/account');
  };

  const handleAddAccount = () => {
    logout(); // Hozirgi sessiyani yopamiz, lekin localStorage da qoladi
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleSignOutAll = async () => {
    await signOut(); // Barcha akkauntlarni o'chiradi
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header__inner" style={{ gap: '1rem' }}>
        
        <Link to="/" className="header__brand" style={{ flexShrink: 0 }}>
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>

        {!isMobile && <Navigation />}
        <div style={{ flex: 1 }}></div>
        {!isMobile && <SearchBar />}

        <div className="header__actions" style={{ marginLeft: '1rem', flexShrink: 0 }}>
          {!isMobile && (
            <button onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} className="btn btn-ghost btn-sm" style={{ fontWeight: 'bold' }}>
              {lang.toUpperCase()}
            </button>
          )}

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className={isAdmin ? 'fa-solid fa-shield' : 'fa-solid fa-user'} />
                <span className="d-none d-md-inline">{isAdmin ? t('auth.admin') : (user?.username || t('auth.account'))}</span>
                <i className="fa-solid fa-caret-down" style={{ fontSize: '0.7rem' }}></i>
              </button>

              {isMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', minWidth: '240px', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  <Link to={isAdmin ? '/admin' : '/account'} onClick={() => setIsMenuOpen(false)} style={{ padding: '0.8rem 1rem', color: '#f5eeee', textDecoration: 'none', borderBottom: '1px solid #48201a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-id-card" style={{ width: '16px' }}></i> Profile
                  </Link>

                  {/* Saqlangan boshqa akkauntlar ro'yxati */}
                  {savedAccounts.filter(a => a.user.id !== user?.id).length > 0 && (
                    <div style={{ borderBottom: '1px solid #48201a', padding: '0.5rem 0' }}>
                      <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', color: '#6b524e' }}>Boshqa akkauntlar</div>
                      {savedAccounts.filter(a => a.user.id !== user?.id).map(acc => (
                        <button key={acc.user.id} onClick={() => handleSwitchAccount(acc)} style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#b9a6a2', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                          <i className="fa-solid fa-user-circle" style={{ width: '16px' }}></i>
                          {acc.user.username}
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={handleAddAccount} style={{ padding: '0.8rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #48201a', color: '#43b581', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-plus" style={{ width: '16px' }}></i> Change Account (Add)
                  </button>

                  <button onClick={handleSignOutAll} style={{ padding: '0.8rem 1rem', background: 'transparent', border: 'none', color: '#ed5555', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i> Sign Out (All)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}