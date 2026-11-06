import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { useCart } from '../context/useCart.js';
import { useLanguage } from '../context/useLanguage.js';
import Navigation from './Navigation.jsx';
import SearchBar from './SearchBar.jsx';
import useToast from '../hooks/useToast.js';
import { fileSystemService } from '../services/fileSystemService.js';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const { info, success, error: toastError } = useToast();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [hasFolder, setHasFolder] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Papka tanlanganligini tekshirish
  useEffect(() => {
    if (!isAuthenticated) { setHasFolder(false); return; }
    fileSystemService.getSavedDirectory()
      .then(handle => setHasFolder(!!handle))
      .catch(() => setHasFolder(false));
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fuzz uchun papka tanlash (Fayl yuklanmaydi, faqat brauzer API si)
  const handleInstallFuzz = async () => {
    if (!isAuthenticated) {
      info("Iltimos, avval tizimga kiring.");
      navigate('/login');
      return;
    }

    // Brauzer qo'llab-quvvatlashini tekshirish
    if (!window.showDirectoryPicker) {
      toastError("Brauzeringiz papka tanlashni qo'llab-quvvatlamaydi. Iltimos, Chrome, Edge yoki Opera brauzeridan foydalaning.");
      return;
    }

    try {
      // Bu funksiya ichida brauzerning maxsus oynasi ochiladi
      await fileSystemService.selectDirectory();
      setHasFolder(true);
      success("✅ Fuzz papkasi tanlandi! Endi o'yinlarni o'rnatishingiz mumkin.");
      navigate('/library');
    } catch (err) {
      if (err.message.includes('bekor qilindi')) {
        info("Papka tanlash bekor qilindi.");
      } else {
        toastError("Xato: " + err.message);
      }
    }
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand">
          <img src="/image/logo.png" alt="Fuzz logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Fuzz</span>
        </Link>

        {!isMobile && <Navigation />}
        
        <div style={{ flex: 1 }}></div>

        {!isMobile && <SearchBar />}
        
        <div className="header__actions" style={{ marginLeft: '1rem' }}>
          
          {/* Install Fuzz tugmasi - faqat desktop uchun, faqat papka tanlanmagan bo'lsa */}
          {!isMobile && isAuthenticated && !hasFolder && (
            <button 
              onClick={handleInstallFuzz} 
              className="btn btn-primary btn-sm" 
              style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}
              title="Fuzz uchun papka tanlash"
            >
              <i className="fa-solid fa-folder-plus" /> Install Fuzz
            </button>
          )}

          {!isMobile && (
            <button 
              onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} 
              className="btn btn-ghost btn-sm" 
              style={{ fontWeight: 'bold' }}
            >
              {lang.toUpperCase()}
            </button>
          )}

          <Link to="/cart" className="header__icon-btn">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="header__badge">{count}</span>}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin" : "/account"} className="btn btn-ghost btn-sm">
                <i className={isAdmin ? "fa-solid fa-shield" : "fa-solid fa-user"} /> 
                <span className="d-none d-md-inline">{isAdmin ? 'Admin' : (user?.username || 'Account')}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">{t('auth.login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}