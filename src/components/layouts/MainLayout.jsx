import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';
import Footer from '../common/Footer.jsx';

export default function MainLayout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}