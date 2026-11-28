import { defineConfig } from "@playwright/test";
import { createServer } from "node:net";

// Pick a free port once in the main process. Workers inherit the variable, and
// parallel checkouts no longer share the fixtures server on port 4173.
if (!process.env.CHULAPA2_TEST_PORT) {
  process.env.CHULAPA2_TEST_PORT = String(await new Promise((resolve, reject) => {
    const server = createServer().once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  }));
}

const baseURL = `http://127.0.0.1:${process.env.CHULAPA2_TEST_PORT}/chulapa2/`;

export default defineConfig({
  testDir: "test/browser",
  use: { baseURL },
  webServer: {
    command: "npm run preview:test",
    url: baseURL,
    timeout: 180_000,
  },
});
