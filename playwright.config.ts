import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 1,
  reporter: 'html',
  timeout: 30_000,
  use: {
    baseURL: 'https://www.saucedemo.com',
    // A saucedemo.com a data-test attribútumot használja test-id-ként
    // (nem a Playwright alapértelmezett data-testid attribútumát).
    testIdAttribute: 'data-test',
    // 'retain-on-failure': minden buktatott tesztről (nem csak retry esetén)
    // készül trace fájl, így pontosan visszajátszható, mi történt a hiba pillanatában.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Explicit action/navigation timeout, hogy egy lassú hálózat esetén
    // világosabb, korábbi hibaüzenetet kapjunk, mint a teljes hook 30s timeout-ja.
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});