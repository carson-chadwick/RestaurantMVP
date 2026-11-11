import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env.demo.local")) {
  process.loadEnvFile(".env.demo.local");
}

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev:e2e",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    timeout: 120_000,
    wait: { stdout: /Ready in/ },
  },
});
