import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL
if (!baseURL) throw new Error('falta E2E_BASE_URL (usa: make e2e)')

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
