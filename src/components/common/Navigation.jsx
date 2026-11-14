import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

export default function Navigation() {
  const { t } = useLanguage();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const walletRef = useRef(null);

  const balanceNum = user?.balance != null ? Number(user.balance) : null;
  const balance = (balanceNum != null && !isNaN(balanceNum)) ? `$${balanceNum.toFixed(2)}` : null;

  // Tashqariga bosilganda menyuni yopish
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (walletRef.current && !walletRef.current.contains(e.target)) {
        setIsWalletOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="header__nav" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', gap: '0.5rem' }}>
      
      {/* HOME + DROPDOWN MENU */}
      <div className="nav-dropdown">
        <NavLink to="/" end className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>
          {t('nav.home')}
        </NavLink>

        {isAuthenticated && (
          <div className="nav-dropdown-content">
            <NavLink to="/profile">{t('nav.profile')}</NavLink>
            <NavLink to="/settings">{t('nav.editProfile')}</NavLink>
            <NavLink to="/security">{t('nav.security')}</NavLink>
          </div>
        )}
      </div>

      <div className="nav-dropdown">
        <NavLink to="/store" className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>
          {t('nav.store')}
        </NavLink>
        <div className="nav-dropdown-content">
          <NavLink to="/store">{t('store.title')}</NavLink>
          <NavLink to="/new-releases">{t('home.newReleases')}</NavLink>
          <NavLink to="/top-sellers">{t('home.topSellers')}</NavLink>
        </div>
      </div>

      <div className="nav-dropdown">
        <NavLink to="/library" className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>
          {t('nav.library')}
        </NavLink>
        <div className="nav-dropdown-content">
          <NavLink to="/library">{t('nav.library')}</NavLink>
          <NavLink to="/downloads">{t('common.downloads')}</NavLink>
          <NavLink to="/purchases">{t('common.purchases')}</NavLink>
        </div>
      </div>

      {/* WALLET + BALANCE */}
      <div className="nav-dropdown" ref={walletRef} style={{ position: 'relative' }}>
        <div
          className="nav-dropdown-btn"
          style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            if (isAuthenticated) refreshUser();
            setIsWalletOpen(!isWalletOpen); // Bosilganda menyuni ochish
          }}
        >
          <i className="fa-solid fa-wallet" style={{ fontSize: '0.9rem' }}></i>
          <span>
            {t('nav.wallet')}
            {isAuthenticated && balance && ` (${balance})`}
          </span>
        </div>

        {/* Menyu ochilganda ko'rinadigan qism */}
        {isWalletOpen && (
          <div className="nav-dropdown-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <NavLink to="/wallet/topup" onClick={() => setIsWalletOpen(false)}>{t('wallet.topUp')}</NavLink>
            <NavLink to="/wallet/history" onClick={() => setIsWalletOpen(false)}>{t('wallet.history')}</NavLink>
            <NavLink to="/wallet/refund" onClick={() => setIsWalletOpen(false)}>{t('wallet.refund')}</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}