import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:5173";
const apiUrl = "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "./tarasibale-test",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      name: "API",
      command: "npm run dev --workspace Backend",
      url: `${apiUrl}/api/health/db`,
      env: { HOST: "127.0.0.1", PORT: "3001", PORTFOLIO_MODE: "true" },
      reuseExistingServer: false,
    },
    {
      name: "Frontend",
      command: "npm run dev --workspace Frontend -- --host 127.0.0.1 --port 5173",
      url: frontendUrl,
      env: { API_PROXY_TARGET: apiUrl, VITE_PORTFOLIO_MODE: "true" },
      reuseExistingServer: false,
    },
  ],
});
