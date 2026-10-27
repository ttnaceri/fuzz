import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', marginTop: 'auto', padding: '3rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          
          {/* 1-ustun: Logo va Ma'lumot */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img src="/image/logo.png" alt="Fuzz Logo" style={{ height: 40 }} onError={(e) => e.currentTarget.style.display = 'none'} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: 1 }}>FUZZ</span>
              <div style={{ padding: '4px 8px', border: '2px solid var(--color-text-muted)', borderRadius: 4, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: 2 }}>
                UPDATE INC.
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: 400, lineHeight: 1.6 }}>
              © {new Date().getFullYear()} Update Inc. All rights reserved. All trademarks are property of their respective owners in the US and other countries.
              VAT included in all prices where applicable.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
              <a href="#" aria-label="Bluesky"><i className="fa-brands fa-bluesky" /></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook" /></a>
              <a href="#" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter" /></a>
            </div>
          </div>

          {/* 2-ustun: FUZZ */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Fuzz</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/about" className="text-muted">About Fuzz</Link></li>
              <li><Link to="/support" className="text-muted">Fuzz SSA</Link></li>
              <li><Link to="/about" className="text-muted">Fuzzworks</Link></li>
              <li><Link to="/store" className="text-muted">Fuzz Distribution</Link></li>
              <li><Link to="/cart" className="text-muted">Gift Cards</Link></li>
            </ul>
          </div>

          {/* 3-ustun: UPDATE INC */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Update Inc.</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/about" className="text-muted">About Update</Link></li>
              <li><a href="#" className="text-muted">Jobs</a></li>
              <li><a href="#" className="text-muted">Hardware</a></li>
              <li><a href="#" className="text-muted">Recycling</a></li>
            </ul>
          </div>

          {/* 4-ustun: LEGAL */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><a href="#" className="text-muted">Privacy</a></li>
              <li><a href="#" className="text-muted">Accessibility</a></li>
              <li><a href="#" className="text-muted">Notices & Policies</a></li>
              <li><a href="#" className="text-muted">Cookies</a></li>
              <li><a href="#" className="text-muted">Refunds</a></li>
            </ul>
          </div>

          {/* 5-ustun: MORE */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>More</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><a href="#" className="text-muted">Get Fuzz</a></li>
              <li><a href="#" className="text-muted">Get Mobile Apps</a></li>
              <li><Link to="/support" className="text-muted">Get Support</Link></li>
              <li><Link to="/account" className="text-muted">My Account</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}