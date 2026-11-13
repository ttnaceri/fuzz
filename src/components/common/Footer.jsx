import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage.js';

export default function Footer() {
  const { t } = useLanguage();

  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  const footerLinks = [
    {
      title: t('footer.about'),
      links: [
        { name: t('footer.aboutFuzz'), path: '/footer/about' },
        { name: t('footer.jobs'), path: '/footer/jobs' },
        { name: t('footer.steamworks'), path: '/footer/steamworks' },
        { name: t('footer.distribution'), path: '/footer/distribution' },
        { name: t('footer.support'), path: '/footer/support' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { name: t('footer.privacy'), path: '/footer/privacy' },
        { name: t('footer.legalPage'), path: '/footer/legal' },
        { name: t('footer.subscriberAgreement'), path: '/footer/subscriber-agreement' },
        { name: t('footer.refunds'), path: '/footer/refunds' },
        { name: t('footer.terms'), path: '/footer/terms' },
        { name: t('footer.cookies'), path: '/footer/cookies' },
      ],
    },
    {
      title: t('footer.more'),
      links: [
        { name: t('footer.allGames'), path: '/store' },
        { name: t('home.categories'), path: '/categories' },
        { name: t('home.newReleases'), path: '/new-releases' },
        { name: t('home.specialOffers'), path: '/special-offers' },
        { name: t('home.freeGames'), path: '/free-games' },
      ],
    },
  ];

  return (
    <footer style={{ backgroundColor: '#19100e', borderTop: '1px solid #48201a', padding: '4rem 0 2rem 0', color: '#b9a6a2', paddingBottom: '80px' /* Mobil menyu uchun joy */ }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img
                src="/image/logo.png"
                alt="Fuzz Logo"
                style={{ height: '48px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <a href="https://github.com/ttnaceri" target="_blank" rel="noopener noreferrer" className="update-logo-link">
                <img
                  src="/image/update.png"
                  alt="Update Inc."
                  style={{ height: '40px', objectFit: 'contain', transition: 'opacity 0.2s' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="update-logo-img"
                />
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', flex: '2 1 600px' }}>
            {footerLinks.map((col, idx) => (
              <div key={idx} style={{ minWidth: '150px' }}>
                {/* Sarlavha rangi yorqinroq qilindi (#ed5555) */}
                <h3 style={{ color: '#ed5555', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 'bold' }}>
                  {col.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.path}
                        style={{ color: '#b9a6a2', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => (e.target.style.color = '#f5eeee')}
                        onMouseLeave={(e) => (e.target.style.color = '#b9a6a2')}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #48201a', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p
            style={{ fontSize: '0.75rem', userSelect: 'none', WebkitUserSelect: 'none', margin: 0, maxWidth: '800px', lineHeight: '1.5' }}
            onCopy={preventCopy}
            onContextMenu={preventCopy}
          >
            © {new Date().getFullYear()} Fuzz. by: UPDATE Inc.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="https://github.com/ttnaceri/" target="_blank" rel="noopener noreferrer" style={{ color: '#b9a6a2', fontSize: '1.2rem' }} title="GitHub">
              <i className="fa-brands fa-github"></i>
            </a>
            <a href="https://t.me/updateDevNews" target="_blank" rel="noopener noreferrer" style={{ color: '#b9a6a2', fontSize: '1.2rem' }} title="Telegram">
              <i className="fa-brands fa-telegram"></i>
            </a>
            <a href="https://www.instagram.com/update.dev26/" target="_blank" rel="noopener noreferrer" style={{ color: '#b9a6a2', fontSize: '1.2rem' }} title="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .update-logo-link:hover .update-logo-img {
          content: url('/image/updateHover.png');
        }
      `}</style>
    </footer>
  );
}