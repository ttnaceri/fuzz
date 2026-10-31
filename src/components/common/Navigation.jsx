import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function Navigation() {
  const { t } = useLanguage();
  const [balance] = useState();
  const [rate, setRate] = useState(12500);

  useEffect(() => {
    fetch("https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data?.conversion_rates?.UZS) setRate(data.conversion_rates.UZS);
      })
      .catch(err => console.warn("API xatosi:", err));
  }, []);

  return (
    <nav className="header__nav" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', gap: '0.2rem' }}>
      <NavLink to="/" end style={{ whiteSpace: 'nowrap' }}>{t('nav.home')}</NavLink>

      <div className="nav-dropdown">
        <NavLink to="/store" className="nav-dropdown-btn" style={{ whiteSpace: 'nowrap' }}>{t('nav.store')}</NavLink>
        <div className="nav-dropdown-content">
          <NavLink to="/store">{t('store.title') || 'Store'}</NavLink>
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

      {/* WALLET DROPDOWN */}
      <div className="nav-dropdown">
        <div className="nav-dropdown-btn" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <i className="fa-solid fa-wallet" style={{ fontSize: '0.9rem' }}></i>
          <span>
            {t('nav.wallet')} 
            {balance > 0 && ` ($${balance.toFixed(2)})`}
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