import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/useLanguage.js';
import useAuth from '../../hooks/useAuth.js';

const MENU_WIDTH = 220;
const MENU_HEIGHT = 340; // tahminiy

export default function ContextMenu({ x, y, onClose }) {
  const { lang, setLang, t } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Ekran chegarasini hisoblash
  const safeX = Math.min(x, window.innerWidth - MENU_WIDTH - 10);
  const safeY = Math.min(y, window.innerHeight - MENU_HEIGHT - 10);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  const menuStyle = {
    position: 'fixed',
    top: `${safeY}px`,
    left: `${safeX}px`,
    backgroundColor: '#241411',
    border: '1px solid #48201a',
    borderRadius: '6px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
    padding: '0.5rem 0',
    width: `${MENU_WIDTH}px`,
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
  };

  const itemStyle = {
    padding: '0.6rem 1rem',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#f5eeee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    width: '100%',
  };

  const activeItemStyle = {
    ...itemStyle,
    backgroundColor: 'rgba(138, 18, 0, 0.2)',
    color: '#8a1200',
    fontWeight: 'bold',
  };

  const divider = (
    <div style={{ height: '1px', backgroundColor: '#48201a', margin: '0.4rem 0' }} />
  );

  return (
    <div style={menuStyle} ref={menuRef}>
      {/* Reload */}
      <button style={itemStyle} onClick={() => handleAction(() => window.location.reload())}>
        <i className="fa-solid fa-rotate-right" style={{ width: 16 }}></i>
        <span>Reload</span>
      </button>

      {divider}

      {/* Language */}
      <div style={{ padding: '0.4rem 1rem', color: '#b9a6a2', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <i className="fa-solid fa-globe" style={{ marginRight: '0.5rem' }}></i>
        Til / Язык / Language
      </div>

      <button
        style={lang === 'uz' ? activeItemStyle : itemStyle}
        onClick={() => handleAction(() => setLang('uz'))}
      >
        <span style={{ width: 20, textAlign: 'center' }}>🇺🇿</span>
        <span>O'zbekcha</span>
        {lang === 'uz' && <i className="fa-solid fa-check" style={{ marginLeft: 'auto' }}></i>}
      </button>

      <button
        style={lang === 'ru' ? activeItemStyle : itemStyle}
        onClick={() => handleAction(() => setLang('ru'))}
      >
        <span style={{ width: 20, textAlign: 'center' }}>🇷🇺</span>
        <span>Русский</span>
        {lang === 'ru' && <i className="fa-solid fa-check" style={{ marginLeft: 'auto' }}></i>}
      </button>

      <button
        style={lang === 'en' ? activeItemStyle : itemStyle}
        onClick={() => handleAction(() => setLang('en'))}
      >
        <span style={{ width: 20, textAlign: 'center' }}>🇬🇧</span>
        <span>English</span>
        {lang === 'en' && <i className="fa-solid fa-check" style={{ marginLeft: 'auto' }}></i>}
      </button>

      {divider}

      {/* Navigation */}
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/'))}>
        <i className="fa-solid fa-house" style={{ width: 16 }}></i>
        <span>{t('nav.home')}</span>
      </button>
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/store'))}>
        <i className="fa-solid fa-store" style={{ width: 16 }}></i>
        <span>{t('nav.store')}</span>
      </button>
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/library'))}>
        <i className="fa-solid fa-book" style={{ width: 16 }}></i>
        <span>{t('nav.library')}</span>
      </button>

      {/* Admin Console (faqat admin uchun) */}
      {isAdmin && (
        <>
          {divider}
          <button
            style={{ ...itemStyle, color: '#43b581' }}
            onClick={() => handleAction(() => navigate('/admin'))}
          >
            <i className="fa-solid fa-shield-halved" style={{ width: 16 }}></i>
            <span>Admin Console</span>
          </button>
        </>
      )}

      {divider}

      {/* Back/Forward */}
      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem 0.5rem' }}>
        <button
          style={{ ...itemStyle, justifyContent: 'center' }}
          onClick={() => handleAction(() => window.history.back())}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button
          style={{ ...itemStyle, justifyContent: 'center' }}
          onClick={() => handleAction(() => window.history.forward())}
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}