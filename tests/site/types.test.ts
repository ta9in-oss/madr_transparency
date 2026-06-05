import { describe, it, expect } from 'vitest';
import { CATEGORY_COLORS, getCategoryColor } from '@lib/categoryColors';

describe('categoryColors', () => {
  it('has a color for banane', () => {
    expect(CATEGORY_COLORS.banane).toBe('#ca8a04');
  });

  it('has a color for tomate', () => {
    expect(CATEGORY_COLORS.tomate).toBe('#dc2626');
  });

  it('returns forest as default for unknown categories', () => {
    expect(getCategoryColor('xyz_unknown')).toBe('#2d6a4f');
  });

  it('matches category key case-insensitively', () => {
    expect(getCategoryColor('Banane')).toBe('#ca8a04');
    expect(getCategoryColor('TOMATE')).toBe('#dc2626');
  });

  it('has at least 8 categories defined', () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThanOrEqual(8);
  });
});
