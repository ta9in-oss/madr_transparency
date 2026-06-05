/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink:           '#111318',
        forest:        '#2d6a4f',
        'forest-dark': '#1a3d2e',
        'forest-tint': 'rgba(45,106,79,0.09)',
        paper:         '#fafaf8',
        surface:       '#f3f2ef',
        line:          '#e5e4e0',
        muted:         '#6b7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"',         'sans-serif'],
        mono:    ['"DM Mono"',       'monospace'],
        arabic:  ['"Noto Sans Arabic"', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
        'display-md': ['1.5rem',  { lineHeight: '2rem',   fontWeight: '700' }],
        'display-sm': ['1.05rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'body':       ['0.875rem', { lineHeight: '1.5rem' }],
        'data':       ['0.78rem',  { lineHeight: '1.25rem' }],
      },
    },
  },
  plugins: [],
};
