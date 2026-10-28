import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { t, lang, setLang } = useLanguage();

  const toggleLang = () => {
    if (lang === 'en') setLang('uz');
    else if (lang === 'uz') setLang('ru');
    else setLang('en');
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
          
          {/* Til almashtirish tugmasi */}
          <button className="header__icon-btn" onClick={toggleLang} title="Change Language">
            <i className="fa-solid fa-globe" />
            <span style={{ fontSize: '0.75rem', marginLeft: 4, textTransform: 'uppercase' }}>{lang}</span>
          </button>

          <Link to="/cart" className="header__icon-btn" aria-label="Cart">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          <Link to="/notifications" className="header__icon-btn" aria-label="Notifications">
            <i className="fa-solid fa-bell" />
          </Link>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  <i className="fa-solid fa-shield" /> {t('auth.admin')}
                </Link>
              )}
              <Link to="/account" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-user" /> {user?.username || t('auth.account')}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout} title={t('auth.logout')}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('auth.register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}