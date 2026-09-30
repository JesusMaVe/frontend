/// <reference types="vitest/config" />
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { devServer } from './vite.dev.ts'

export default defineConfig(({ command, mode }) => ({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
  server: command === 'serve' && mode !== 'test' ? devServer(loadEnv(mode, process.cwd(), '')) : undefined,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    // Valores fijos para los tests (independientes del .env de cada quien).
    env: { VITE_LOG_JWT: 'false', VITE_ITEM_TITLE_MAX: '20', VITE_ITEM_DESCRIPTION_MAX: '50' },
  },
}))
