import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@lib': '/src/lib',
      '@i18n': '/src/i18n',
    },
  },
});
