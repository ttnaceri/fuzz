import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

export default function Navigation() {
  const { t, lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  // Balans mavjud bo'lsa, uni formatlaymiz
  const balance = user?.balance ? `$${Number(user.balance).toFixed(1)}` : '';

  return (
    <nav className="header__nav" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', gap: '0.2rem' }}>
      <NavLink to="/" end style={{ whiteSpace: 'nowrap' }}>{t('nav.home')}</NavLink>

      <div className="nav-dropdown">
        <NavLink to="/store" className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>{t('nav.store')}</NavLink>
        <div className="nav-dropdown-content">
          <NavLink to="/store">{t('store.title')}</NavLink>
          <NavLink to="/new-releases">{t('home.newReleases')}</NavLink>
          <NavLink to="/top-sellers">{t('home.topSellers')}</NavLink>
        </div>
      </div>

      <div className="nav-dropdown">
        <NavLink to="/library" className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>{t('nav.library')}</NavLink>
        <div className="nav-dropdown-content">
          <NavLink to="/library">{t('nav.library')}</NavLink>
          <NavLink to="/downloads">Downloads</NavLink>
          <NavLink to="/purchases">Purchases</NavLink>
        </div>
      </div>

      {/* WALLET + BALANCE (YANGI) */}
      <div className="nav-dropdown">
        <div 
          className="nav-dropdown-btn" 
          style={{ 
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: isAuthenticated ? '#43b581' : '#b9a6a2' 
          }}
        >
          <i className="fa-solid fa-wallet" style={{ fontSize: '0.9rem' }}></i>
          <span>
            {t('nav.wallet')} 
            {isAuthenticated && balance && ` (${balance})`}
          </span>
        </div>
        
        <div className="nav-dropdown-content">
          <NavLink to="/wallet/history">{t('wallet.history')}</NavLink>
          <NavLink to="/wallet/topup">{t('wallet.topUp')}</NavLink>
          <NavLink to="/wallet/refund">{t('wallet.refund')}</NavLink>
        </div>
      </div>
    </nav>
  );
}