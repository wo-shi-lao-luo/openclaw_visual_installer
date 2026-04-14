import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: path.resolve(__dirname, 'renderer'),
  build: {
    outDir: path.resolve(__dirname, '../dist-gui/renderer'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'chrome120',
  },
  resolve: {
    alias: {
      // Allow renderer to import from gui/shared without relative crawls
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
