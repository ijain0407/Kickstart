import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enQuiz from './locales/en/quiz.json';
import enProgress from './locales/en/progress.json';
import esCommon from './locales/es/common.json';
import esQuiz from './locales/es/quiz.json';
import esProgress from './locales/es/progress.json';

// TODO(A): fold these namespaces into the app-wide i18next setup; the resource shape stays the same.
export const SUPPORTED_LANGUAGES = ['en', 'es'];
const STORAGE_KEY = 'kickstart.lang';

function initialLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(nav) ? nav : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, quiz: enQuiz, progress: enProgress },
    es: { common: esCommon, quiz: esQuiz, progress: esProgress },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  ns: ['common', 'quiz', 'progress'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* storage unavailable */
  }
});
document.documentElement.lang = i18n.language;

export default i18n;
