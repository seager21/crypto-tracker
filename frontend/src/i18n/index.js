import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Supported languages
export const LANGUAGES = {
  en: { nativeName: 'English' },
  es: { nativeName: 'Español' },
  fr: { nativeName: 'Français' },
  de: { nativeName: 'Deutsch' },
  ja: { nativeName: '日本語' },
};

i18n
  // load translations using http (default public/locales)
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.MODE === 'development',
    supportedLngs: Object.keys(LANGUAGES),

    interpolation: {
      escapeValue: false, // not needed for React
    },

    // Default detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
