import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', padding: '3rem 0 2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img src="/image/logo.png" alt="Fuzz Logo" style={{ height: 40 }} onError={(e) => e.currentTarget.style.display = 'none'} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: 1 }}>FUZZ</span>
              <div style={{ padding: '4px 8px', border: '2px solid var(--color-text-muted)', borderRadius: 4, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: 2 }}>
                UPDATE INC.
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: 400, lineHeight: 1.6 }}>
              © {new Date().getFullYear()} Update Inc. {t('footer.rights')}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>{t('footer.fuzz')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/about" className="text-muted">{t('footer.about')}</Link></li>
              <li><Link to="/support" className="text-muted">{t('footer.support')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>{t('footer.legal')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><a href="#" className="text-muted">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-muted">{t('footer.refunds')}</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>{t('footer.more')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/account" className="text-muted">{t('footer.myAccount')}</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}