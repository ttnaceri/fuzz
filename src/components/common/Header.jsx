import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [lang, setLang] = useState('UZ'); // Til holati

  const toggleLang = () => {
    setLang((prev) => (prev === 'UZ' ? 'EN' : 'UZ'));
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
          {/* Til o'zgartirgich */}
          <button 
            onClick={toggleLang} 
            className="btn btn-ghost btn-sm" 
            style={{ fontWeight: 'bold', minWidth: '40px' }}
            title="Change Language"
          >
            {lang}
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
                  <i className="fa-solid fa-shield" /> Admin
                </Link>
              )}
              <Link to="/account" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-user" /> {user?.username || 'Account'}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}