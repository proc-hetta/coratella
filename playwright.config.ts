import { defineConfig, devices } from '@playwright/test';

export const databaseUrl = 'postgres://postgres:coratella@localhost:54329/postgres';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'docker run --rm --name coratella-e2e-db -p 54329:5432 -e POSTGRES_PASSWORD=coratella postgres:18-alpine',
      port: 54329,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm build && pnpm preview --port 4173 --strictPort',
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        DATABASE_URL: databaseUrl,
        CORATELLA_SECRET: 'e2e-secret',
        PUBLIC_TITLE: 'E2E Title',
        PUBLIC_LOGO: '/favicon.ico',
        PUBLIC_LOGOLIGHT: '/favicon.ico',
        PUBLIC_LOGODARK: '/favicon.ico',
      },
    },
  ],
});
