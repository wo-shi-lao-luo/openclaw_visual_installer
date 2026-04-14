import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite always injects <script type="module" crossorigin> regardless of rollup
// output format. For Electron file:// loading we need a plain deferred script:
// - Remove type="module" (avoids CORS fetch mode on file:// protocol)
// - Remove crossorigin
// - Add defer so the script runs after the DOM is parsed (#root exists)
function stripModuleType(): Plugin {
  return {
    name: 'strip-module-type',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin/g, '<script defer')
        .replace(/<link rel="modulepreload"[^>]*>/g, '');
    },
  };
}

export default defineConfig({
  plugins: [react(), stripModuleType()],
  base: './',
  root: path.resolve(__dirname, 'renderer'),
  build: {
    outDir: path.resolve(__dirname, '../dist-gui/renderer'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'chrome120',
    // IIFE format: avoids <script type="module" crossorigin> which fails silently
    // when loaded via file:// in Electron's sandboxed renderer.
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    modulePreload: false,
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
