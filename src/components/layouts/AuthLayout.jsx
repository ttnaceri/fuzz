import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="header__brand">
            <img src="/image/logo.png" alt="Fuzz" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span>Fuzz</span>
          </Link>
        </div>
      </header>
      <main className="auth-page">
        <Outlet />
      </main>
    </div>
  );
}