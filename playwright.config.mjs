import { defineConfig } from "@playwright/test";

const origin = "http://127.0.0.1:4173";
const baseURL = `${origin}/chulapa2/`;

export default defineConfig({
  testDir: "test/browser",
  use: { baseURL },
  webServer: {
    command: "npm run preview:test",
    url: baseURL,
    timeout: 180_000,
  },
});
