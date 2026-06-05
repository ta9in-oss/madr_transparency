import fr from '@i18n/fr.json';
import ar from '@i18n/ar.json';
import en from '@i18n/en.json';
import type { Lang } from './types';

type TranslationDict = Record<string, Record<string, string>>;

const translations: Record<Lang, TranslationDict> = { fr, ar, en };

export function getTranslations(lang: Lang): TranslationDict {
  return translations[lang];
}

export function t(lang: Lang, key: string): string {
  const [section, ...rest] = key.split('.');
  const dict = translations[lang];
  const sectionDict = dict[section];
  if (!sectionDict) return key;
  const leafKey = rest.join('.');
  return sectionDict[leafKey] ?? key;
}
