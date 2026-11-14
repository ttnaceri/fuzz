// src/components/layouts/MainLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';
import Footer from '../common/Footer.jsx';
import BottomNav from '../common/BottomNav.jsx';
import ContextMenu from '../common/ContextMenu/ContextMenu.jsx';

export default function MainLayout() {
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault(); 
      setContextMenu({ x: e.clientX, y: e.clientY }); 
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="layout">
      <Header />
      {/* Ortiqcha paddinglar olib tashlandi */}
      <main className="layout__main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
      
      {/* BottomNav o'zi App bo'lmasa ko'rinmaydi */}
      <BottomNav />

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </div>
  );
}