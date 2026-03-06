import cs from '@/locales/cs.json';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const dictionaries = { cs, en, ur };

export function getDictionary(lang: 'cs' | 'en' | 'ur') {
  return dictionaries[lang];
}
