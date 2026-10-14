import { defineConfig } from "@playwright/test";

// The service worker only exists in production builds, so this suite runs
// against `vite preview` instead of the dev server.
export default defineConfig({
  testDir: "./tests",
  testMatch: "pwa.spec.ts",
  timeout: 60_000,
  workers: 1,
  reporter: "list",
  outputDir: "/tmp/club-lion-pwa-test-results",
  use: {
    baseURL: "http://localhost:5194",
    viewport: { width: 1180, height: 820 },
    trace: "retain-on-failure",
  },
  projects: [{ name: "tablet", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run build && npx vite preview --port 5194 --strictPort",
    url: "http://localhost:5194",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
