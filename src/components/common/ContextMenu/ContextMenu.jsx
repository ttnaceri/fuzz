import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/useLanguage.js';

export default function ContextMenu({ x, y, onClose }) {
  const { setLang } = useLanguage();
  const navigate = useNavigate();
  const menuRef = useRef(null);

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

  const handleAction = (action) => { action(); onClose(); };

  const menuStyle = {
    position: 'fixed', top: `${y}px`, left: `${x}px`,
    backgroundColor: '#241411', border: '1px solid #48201a',
    borderRadius: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
    padding: '0.5rem 0', width: '200px', zIndex: 99999,
    display: 'flex', flexDirection: 'column'
  };

  const itemStyle = {
    padding: '0.6rem 1rem', textAlign: 'left', background: 'transparent',
    border: 'none', color: '#f5eeee', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem'
  };

  return (
    <div style={menuStyle} ref={menuRef}>
      <button style={itemStyle} onClick={() => handleAction(() => window.location.reload())}>
        <i className="fa-solid fa-rotate-right"></i> Reload
      </button>
      <div style={{ height: '1px', backgroundColor: '#48201a', margin: '0.5rem 0' }}></div>
      <button style={itemStyle} onClick={() => handleAction(() => setLang('uz'))}>O'zbekcha</button>
      <button style={itemStyle} onClick={() => handleAction(() => setLang('ru'))}>Русский</button>
      <button style={itemStyle} onClick={() => handleAction(() => setLang('en'))}>English</button>
      <div style={{ height: '1px', backgroundColor: '#48201a', margin: '0.5rem 0' }}></div>
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/'))}>Home</button>
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/store'))}>Store</button>
      <button style={itemStyle} onClick={() => handleAction(() => navigate('/library'))}>Library</button>
    </div>
  );
}