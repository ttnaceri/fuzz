import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';
import Footer from '../common/Footer.jsx';
import BottomNav from '../common/BottomNav.jsx';

export default function MainLayout() {
  return (
    <div className="layout">
      {/* Kompyuter va telefonlar uchun yuqori Header */}
      <Header />
      
      {/* Asosiy kontent qismi */}
      <main className="layout__main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      
      {/* Pastki qism (Footer) */}
      <Footer />

      {/* Faqat mobil qurilmalar uchun pastki navigatsiya */}
      <BottomNav />
    </div>
  );
}