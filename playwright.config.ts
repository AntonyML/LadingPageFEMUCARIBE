import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm exec astro preview --host 127.0.0.1 --port 4322',
      url: 'http://127.0.0.1:4322',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command:
        'pnpm exec astro build --root tests/fixtures/government-bar && pnpm exec astro preview --root tests/fixtures/government-bar --host 127.0.0.1 --port 4323',
      url: 'http://127.0.0.1:4323',
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
