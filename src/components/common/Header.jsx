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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header desktop-only-header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>

        <Navigation />
        
        <div style={{ flex: 1 }}></div>

        <SearchBar />
        
        <div className="header__actions" style={{ marginLeft: '1rem' }}>
          <button 
            onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} 
            className="btn btn-ghost btn-sm" 
            style={{ fontWeight: 'bold' }}
          >
            {lang.toUpperCase()}
          </button>

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin" : "/account"} className="btn btn-ghost btn-sm">
                <i className={isAdmin ? "fa-solid fa-shield" : "fa-solid fa-user"} /> 
                <span>{isAdmin ? 'Admin Panel' : (user?.username || 'Account')}</span>
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