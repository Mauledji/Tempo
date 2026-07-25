/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate config from vite.config.ts because the test runner doesn't need
// the Tailwind plugin (which slows cold start) and the test environment
// needs jsdom + a setup file for jest-dom matchers and store resets.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/stores/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
})
