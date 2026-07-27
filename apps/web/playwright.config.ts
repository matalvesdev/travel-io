import { defineConfig } from '@playwright/test';

const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './e2e',
  timeout: isCI ? 15000 : 120000,
  fullyParallel: false,
  retries: isCI ? 0 : 1,
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: isCI ? 'off' : 'on-first-retry',
  },
  ...(isCI ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
  }),
});
