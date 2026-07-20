import { defineConfig } from "@playwright/test";
import fs from "fs";

const PORT = 3150;
// Chromium local (conteneur) si présent ; sinon celui installé par Playwright (CI).
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const launchOptions = fs.existsSync(CHROMIUM)
  ? { executablePath: CHROMIUM, args: ["--no-sandbox"] }
  : { args: ["--no-sandbox"] };

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 30_000,
  // Certains scénarios réutilisent le même compte de test → séquentiel.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions,
    trace: "retain-on-failure",
  },
  webServer: {
    // Teste le build de production (comportement le plus proche de Vercel).
    // Lancer `npm run build` avant `npm run test:e2e` si nécessaire.
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
