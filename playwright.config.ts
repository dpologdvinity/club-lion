import { defineConfig } from "@playwright/test";

// scripts/e2e.sh sets PORT so parallel agents never share a server or output folder.
const port = Number(process.env.PORT ?? 5173);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  // The offline-install test needs a production build: run it with `npm run test:pwa`.
  testIgnore: /pwa\.spec\.ts/,
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : "50%",
  reporter: "list",
  outputDir: `/tmp/club-lion-test-results-${port}`,
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium" } },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && !process.env.PORT,
  },
});
