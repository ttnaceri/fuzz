// src/components/context/LanguageContext.jsx
import { createContext, useEffect, useState } from 'react';
import i18n from '../../i18n.js';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(i18n.language || 'uz');

  useEffect(() => {
    const handler = (lng) => setLangState(lng);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  const setLang = (newLang) => {
    if (['en', 'uz', 'ru'].includes(newLang)) {
      i18n.changeLanguage(newLang);
    }
  };

  const t = (key) => i18n.t(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}