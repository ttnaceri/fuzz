import { createContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations.js';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('fuzz_lang') || 'uz'; // Standart til O'zbekcha
  });

  useEffect(() => {
    localStorage.setItem('fuzz_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    if (['en', 'uz', 'ru'].includes(newLang)) {
      setLangState(newLang);
    }
  };

  // Tarjima funksiyasi
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to English if missing
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk]) fallback = fallback[fk];
          else return key;
        }
        return fallback;
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