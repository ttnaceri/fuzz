import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function Footer() {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#19100e', borderTop: '1px solid #48201a', padding: '3rem 2rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <img src="/image/logo.png" alt="Fuzz" style={{ width: '32px', height: '32px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span style={{ color: '#f5eeee', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('footer.brandTitle')}</span>
          </div>
          <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>{t('footer.copyright')}</p>
        </div>

        {/* About */}
        <div>
          <h4 style={{ color: '#f5eeee', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('footer.aboutTitle')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/footer/about" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.about')}</Link>
            <Link to="/footer/jobs" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.jobs')}</Link>
            <Link to="/footer/steamworks" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.steamworks')}</Link>
            <Link to="/footer/distribution" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.distribution')}</Link>
            <Link to="/footer/support" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.support')}</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: '#f5eeee', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('footer.legalTitle')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/footer/privacy" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.privacy')}</Link>
            <Link to="/footer/legal" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.legal')}</Link>
            <Link to="/footer/subscriber-agreement" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.subscriberAgreement')}</Link>
            <Link to="/footer/refunds" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.refunds')}</Link>
            <Link to="/footer/terms" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.terms')}</Link>
            <Link to="/footer/cookies" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.cookies')}</Link>
          </div>
        </div>

        {/* More */}
        <div>
          <h4 style={{ color: '#f5eeee', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t('footer.moreTitle')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/store" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('store.title')}</Link>
            <Link to="/categories" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('home.categories')}</Link>
            <Link to="/new-releases" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('home.newReleases')}</Link>
            <Link to="/special-offers" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('home.specialOffers')}</Link>
            <Link to="/free-games" style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('home.freeGames')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}