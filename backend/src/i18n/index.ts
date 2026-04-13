import { en } from './en.js';
import { bg } from './bg.js';

export const translations = {
  en,
  bg,
};

export type Language = 'en' | 'bg';
export type TranslationKeys = typeof en;

export const getTranslation = (lang: Language = 'en') => {
  return translations[lang] || translations.en;
};

export default translations;
