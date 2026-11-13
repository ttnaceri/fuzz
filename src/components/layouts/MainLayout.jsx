import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';
import Footer from '../common/Footer.jsx';
import BottomNav from '../common/BottomNav.jsx';
import ContextMenu from '../common/ContextMenu/ContextMenu.jsx';

export default function MainLayout() {
  const [contextMenu, setContextMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);

    const handleContextMenu = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault(); 
      setContextMenu({ x: e.clientX, y: e.clientY }); 
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="layout">
      <Header />
      {/* Mobil qurilmada pastki menyu uchun joy qoldiramiz (paddingBottom) */}
      <main className="layout__main" style={{ paddingBottom: isMobile ? '70px' : '0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
      
      {/* BottomNav faqat mobil qurilmalarda ko'rinadi */}
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