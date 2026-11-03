import { useLanguage } from '../context/useLanguage.js';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LanguagePage() {
  const { setLang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // URL dan tilni olish
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && ['uz', 'en', 'ru'].includes(lang)) {
      setLang(lang);
    }
    // Orqaga qaytish
    navigate(-1);
  }, [setLang, navigate]);

  return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Yuklanmoqda...</div>;
}