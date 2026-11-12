import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

// Service Worker'ni ro'yxatdan o'tkazamiz (offline rejim uchun)
registerSW({ immediate: true });

// Online/Offline holatini aniqlash
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  console.log('🟢 Online rejimda');
});
window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  console.log('🔴 Offline rejimda');
});
if (!navigator.onLine) {
  document.body.classList.add('offline');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);