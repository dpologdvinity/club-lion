import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 2,
  reporter: "list",
  outputDir: "/tmp/bee-stop-merged-tests",
  use: {
    baseURL: "http://localhost:5189",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  projects: [{ name: "desktop", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run dev -- --port 5189 --strictPort",
    url: "http://localhost:5189",
    reuseExistingServer: false,
  },
});
