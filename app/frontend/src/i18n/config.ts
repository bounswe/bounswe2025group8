import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation imports
import enTranslation from './locales/en.json';
import trTranslation from './locales/tr.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  tr: {
    translation: trTranslation,
  },
};

// localStorage'dan dili oku veya varsayılan değer kullan
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;

i18n
  .use(LanguageDetector) // Dil algılama
  .use(initReactI18next) // React ile entegre et
  .init({
    resources,
    lng: savedLanguage || 'en', // Kaydedilmiş dil varsa onu kullan, yoksa İngilizce
    fallbackLng: 'en', // Varsayılan dil İngilizce
    supportedLngs: ['en', 'tr'], // Desteklenen diller
    debug: false, // Development'ta true yapabilirsiniz
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },
    detection: {
      order: ['localStorage'], // Sadece localStorage'dan oku
      caches: ['localStorage'], // Seçilen dili localStorage'da sakla
      lookupLocalStorage: 'i18nextLng', // localStorage key adı
    },
  });

export default i18n;
