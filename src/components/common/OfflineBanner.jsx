import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#8a1200',
      color: '#fff',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      zIndex: 99999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <i className="fa-solid fa-wifi" style={{ textDecoration: 'line-through' }}></i>
      Siz offline rejimdasiz — oxirgi ma'lumotlar ko'rsatilmoqda
    </div>
  );
}