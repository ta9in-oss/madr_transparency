import { describe, it, expect } from 'vitest';
import { t, getTranslations } from '@lib/i18n';

describe('t()', () => {
  it('returns the French translation for a known key', () => {
    expect(t('fr', 'nav.home')).toBe('Accueil');
  });

  it('returns the Arabic translation for a known key', () => {
    expect(t('ar', 'nav.home')).toBeTruthy();
  });

  it('returns the English translation for a known key', () => {
    expect(t('en', 'nav.home')).toBeTruthy();
  });

  it('returns the key itself for an unknown key', () => {
    expect(t('fr', 'nav.does_not_exist')).toBe('nav.does_not_exist');
  });

  it('resolves nested keys with dot notation', () => {
    const result = t('fr', 'home.title');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getTranslations()', () => {
  it('returns the full French translation object', () => {
    const translations = getTranslations('fr');
    expect(translations.nav).toBeDefined();
    expect(translations.home).toBeDefined();
    expect(translations.footer).toBeDefined();
  });

  it('all three langs have the same top-level keys', () => {
    const fr = getTranslations('fr');
    const ar = getTranslations('ar');
    const en = getTranslations('en');
    const frKeys = Object.keys(fr).sort();
    expect(Object.keys(ar).sort()).toEqual(frKeys);
    expect(Object.keys(en).sort()).toEqual(frKeys);
  });
});
