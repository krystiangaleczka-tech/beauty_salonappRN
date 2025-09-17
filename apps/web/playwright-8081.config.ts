import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Disable parallel for console error checking
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for error checking
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'off',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Don't start web server since we're testing external Expo server
  webServer: undefined,
});