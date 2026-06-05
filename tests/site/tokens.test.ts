import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../tailwind.config.mjs';

describe('design tokens', () => {
  it('defines ink color', () => {
    expect(tailwindConfig.theme.extend.colors.ink).toBe('#111318');
  });

  it('defines forest color', () => {
    expect(tailwindConfig.theme.extend.colors.forest).toBe('#2d6a4f');
  });

  it('defines paper color', () => {
    expect(tailwindConfig.theme.extend.colors.paper).toBe('#fafaf8');
  });

  it('defines all font families', () => {
    const fonts = tailwindConfig.theme.extend.fontFamily;
    expect(fonts.display).toBeDefined();
    expect(fonts.body).toBeDefined();
    expect(fonts.mono).toBeDefined();
    expect(fonts.arabic).toBeDefined();
  });
});
