import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright config for quality-flow-ng-app E2E tests.
 *
 * The local default targets the mock-auth dev server (`pnpm run start:mock-auth`)
 * which serves on port 4400 and bypasses the OIDC redirect. Override with
 * E2E_BASE_URL when targeting a different environment.
 */
export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4400',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
