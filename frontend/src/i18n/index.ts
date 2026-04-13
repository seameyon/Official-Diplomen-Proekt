import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18nTranslation } from 'react-i18next';
import en from './en.json';
import bg from './bg.json';
import { storage } from '../utils';

const savedLanguage = storage.get<string>('language', 'bg');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bg: { translation: bg },
  },
  lng: savedLanguage,
  fallbackLng: 'bg',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Export useTranslation hook
export const useTranslation = () => {
  const { t, i18n: instance } = useI18nTranslation();
  return { t, i18n: instance, language: instance.language };
};

// Export I18nProvider as a simple pass-through (i18next already initialized)
export const I18nProvider = ({ children }: { children: React.ReactNode }) => children;

export default i18n;
