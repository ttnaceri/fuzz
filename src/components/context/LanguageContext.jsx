import { createContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations.js';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('fuzz_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fuzz_lang', lang);
    // HTML tegiga lang atributini qo'shish (SEO va ekran o'quvchilar uchun)
    document.documentElement.lang = lang;
  }, [lang]);

  // Tarjima qilish funksiyasi (t = translate)
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Agar tarjima topilmasa, ingliz tilidagisini qaytaradi yoki kalitni o'zini
        return translations['en']?.[keys[0]]?.[keys[1]] || key;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}