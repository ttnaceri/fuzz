import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';

export default function AuthLayout() {
  return (
    <div className="layout">
      {/* Header qo'shildi */}
      <Header />
      
      <main className="auth-page">
        <Outlet />
      </main>
    </div>
  );
}