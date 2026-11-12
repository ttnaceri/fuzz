// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './components/locales/translations.js';

const savedLang = localStorage.getItem('fuzz_lang') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      uz: { translation: translations.uz },
      ru: { translation: translations.ru },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('fuzz_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;