import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

export default function Navigation() {
  const { t } = useLanguage();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const balanceNum = user?.balance != null ? Number(user.balance) : null;
  const balance = (balanceNum != null && !isNaN(balanceNum)) ? `$${balanceNum.toFixed(2)}` : null;

  return (
    <nav className="header__nav" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', gap: '0.1rem' }}>
      
      {/* HOME + DROPDOWN MENU */}
      <div className="nav-dropdown" style={{ padding: '0 0.5rem' }}>
        <NavLink to="/" end className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap', padding: '0.5rem 0' }}>
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
      <div className="nav-dropdown">
        <div
          className="nav-dropdown-btn"
          style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { if (isAuthenticated) refreshUser(); }}
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