import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['tests/unit/renderer/**', 'jsdom'],
      ['tests/unit/**', 'node']
    ]
  }
})
