import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

if (!process.env.DOCUMENTS_MANIFEST_PATH) {
  const directory = mkdtempSync(path.join(tmpdir(), 'femucaribe-e2e-docs-'));
  process.env.DOCUMENTS_MANIFEST_PATH = path.join(
    directory,
    'documents-manifest.json',
  );
  process.env.FEMUCARIBE_E2E_DOCUMENTS_DIR = directory;
}

const sitePort = process.env.FEMUCARIBE_E2E_PORT || '4322';
const fixturePort = process.env.FEMUCARIBE_FIXTURE_PORT || '4323';
const adminPort = process.env.FEMUCARIBE_ADMIN_E2E_PORT || '4324';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  globalTeardown: './tests/global-teardown.mjs',
  use: { baseURL: `http://127.0.0.1:${sitePort}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `node tests/start-preview.mjs ${sitePort}`,
      url: `http://127.0.0.1:${sitePort}`,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: `node tests/start-preview.mjs ${adminPort}`,
      url: `http://127.0.0.1:${adminPort}`,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: `pnpm exec astro build --root tests/fixtures/government-bar && pnpm exec astro preview --root tests/fixtures/government-bar --host 127.0.0.1 --port ${fixturePort}`,
      url: `http://127.0.0.1:${fixturePort}`,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
