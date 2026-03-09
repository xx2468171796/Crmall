import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      include: ['apps/portal/src/features/**/services/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/portal/src'),
      '@twcrm/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@twcrm/db': path.resolve(__dirname, 'packages/db/src'),
      '@twcrm/ui': path.resolve(__dirname, 'packages/ui/src'),
    },
  },
})
