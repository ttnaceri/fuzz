import { useLanguage } from '../context/useLanguage.js';

export default function Footer() {
  const { t } = useLanguage();

  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '3rem', padding: '2rem 0', background: 'var(--color-bg-alt)' }}>
      <div className="container">
        
        {/* Yuqori qism: Logotip va Ijtimoiy tarmoqlar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Fuzz</span>
            <span className="text-muted" style={{ marginLeft: 8 }}>| {t('footer.update') || 'Update Inc.'}</span>
          </div>
          
          {/* Ijtimoiy tarmoq havolalari */}
          <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <a href="https://github.com/ttnaceri/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', transition: 'color 0.2s' }} title="GitHub">
                <i className="fa-brands fa-github"></i>
              </a>
            </li>
            <li>
              <a href="https://t.me/updateDevNews" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', transition: 'color 0.2s' }} title="Telegram">
                <i className="fa-brands fa-telegram"></i>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/update.dev26/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', transition: 'color 0.2s' }} title="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </li>
          </ul>
        </div>

        {/* Pastki qism: Copyright */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <p 
            className="text-muted" 
            style={{ fontSize: '0.75rem', userSelect: 'none', WebkitUserSelect: 'none', margin: 0 }}
            onCopy={preventCopy}
            onContextMenu={preventCopy}
          >
            © {new Date().getFullYear()} {t('footer.fuzz') || 'Fuzz'}. {t('footer.rights') || 'All rights reserved.'}
          </p>
        </div>

      </div>
    </footer>
  );
}