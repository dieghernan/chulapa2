import { defineConfig } from "@playwright/test";

const origin = "http://127.0.0.1:4173";
const baseURL = `${origin}/chulapa2/`;

export default defineConfig({
  testDir: "test/browser",
  use: { baseURL },
  webServer: {
    command: "npm run build:test && bundle exec jekyll serve --skip-initial-build --no-watch --host 127.0.0.1 --port 4173 --baseurl /chulapa2 --destination _site_test",
    url: baseURL,
  },
});
