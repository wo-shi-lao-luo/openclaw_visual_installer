import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'implementation/src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'implementation/src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'implementation/src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'implementation/src/renderer/index.html')
        }
      }
    },
    plugins: [react()]
  }
})
