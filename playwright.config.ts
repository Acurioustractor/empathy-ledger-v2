import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Empathy Ledger
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: process.env.CI ? 'github' : 'html',

  /* Shared settings for all projects */
  use: {
    /* Base URL - matches PM2 dev server on port 3030 */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3030',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshots - always for visual testing */
    screenshot: 'on',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile viewports */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Output directories */
  outputDir: 'e2e/test-results',

  /* Snapshot directory for visual comparisons */
  snapshotDir: 'e2e/snapshots',

  /* Expect options for visual comparisons */
  expect: {
    /* Threshold for pixel differences */
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  /* Run local dev server before tests (optional - uses PM2 server if running) */
  webServer: process.env.START_SERVER ? {
    command: 'npm run dev',
    url: 'http://localhost:3030',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  } : undefined,
});
