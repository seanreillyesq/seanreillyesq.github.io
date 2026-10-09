// Playwright config for the interactive-tool regression suite.
// Runs against the built site (_site/), served locally. Chromium only, two widths.
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const PORT = 4173;
const ROOT = path.resolve(__dirname, '..');

module.exports = defineConfig({
  testDir: path.join(__dirname, 'specs'),
  outputDir: path.join(ROOT, 'test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(ROOT, 'playwright-report') }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 --directory _site`,
    cwd: ROOT,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    timeout: 30000,
  },
});
