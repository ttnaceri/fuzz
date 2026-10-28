import { NavLink, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <i className="fa-solid fa-gamepad"></i>
        <span>O'yinlar</span>
      </NavLink>

      <NavLink to="/library" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <i className="fa-solid fa-book"></i>
        <span>Library</span>
      </NavLink>

      {/* Markaziy QR tugmasi */}
      <div className="bottom-nav__center">
        <button onClick={() => navigate('/login?qr=true')} className="bottom-nav__qr-btn" aria-label="QR Login">
          <i className="fa-solid fa-qrcode"></i>
        </button>
      </div>

      <NavLink to="/account" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <i className="fa-solid fa-user"></i>
        <span>Profil</span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
        <i className="fa-solid fa-gear"></i>
        <span>Sozlama</span>
      </NavLink>
    </nav>
  );
}