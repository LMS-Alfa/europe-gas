import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import enTranslation from '../public/locales/en/translation.json';
import ruTranslation from '../public/locales/ru/translation.json';
import uzTranslation from '../public/locales/uz/translation.json';

// Create resources object
const resources = {
  en: {
    translation: enTranslation
  },
  ru: {
    translation: ruTranslation
  },
  uz: {
    translation: uzTranslation
  }
};

i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Detect user language
  .use(LanguageDetector)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: true,
    },
  });

// Force language change to trigger re-render
const originalChangeLanguage = i18n.changeLanguage;
i18n.changeLanguage = async (lng) => {
  const result = await originalChangeLanguage.call(i18n, lng);
  // Update HTML lang attribute
  document.documentElement.setAttribute('lang', lng);
  // Log for debugging
  console.log(`Language changed to: ${lng}`);
  return result;
};

// Export initialized i18n
export default i18n; 