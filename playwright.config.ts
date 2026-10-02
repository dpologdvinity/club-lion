import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  outputDir: "/tmp/club-lion-test-results",
  use: {
    baseURL: "http://localhost:5173",
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
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
