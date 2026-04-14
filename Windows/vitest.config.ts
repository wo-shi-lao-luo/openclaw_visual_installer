import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Default environment for non-renderer tests
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    restoreMocks: true,
    environmentMatchGlobs: [
      // Renderer tests run in jsdom
      ['tests/gui/renderer/**', 'jsdom'],
    ],
    setupFiles: ['tests/setup.ts'],
  },
});
