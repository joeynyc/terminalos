module.exports = {
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: 'file://',
    trace: 'on-first-retry',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...require('playwright').devices['Pixel 5'],
        channel: 'chrome'
      }
    },
    {
      name: 'Mobile Safari',
      use: {
        ...require('playwright').devices['iPhone 14 Pro'],
        channel: 'webkit'
      }
    }
  ]
};