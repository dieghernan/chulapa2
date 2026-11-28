// Build every test fixture site and serve them from _site_test.
// The port comes from CHULAPA2_TEST_PORT (default 4173). Jekyll writes it into
// absolute URLs, so parallel checkouts each need their own port.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = process.env.CHULAPA2_TEST_PORT || "4173";
const url = `http://127.0.0.1:${port}`;
const urlConfig = join(mkdtempSync(join(tmpdir(), "chulapa2-test-")), "url.yml");
writeFileSync(urlConfig, `url: "${url}"\n`);

// [extra config files, baseurl suffix, extra flags]
const builds = [
  [[], "", ["--drafts", "--unpublished"]],
  [["test/_themed.yml"], "/test/themed", ["--unpublished"]],
  [["test/_primary.yml"], "/test/primary", []],
  [["test/_primary.yml", "test/_explicit-primary.yml"], "/test/explicit-primary", []],
  [["test/_primary.yml", "test/_dual.yml"], "/test/dual", ["--unpublished"]],
  [["test/_explicit-dark.yml"], "/test/explicit-dark", []],
  [["test/_gitdev.yml"], "/test/gitdev", ["--unpublished"]],
  [["test/_gitdev-dual.yml"], "/test/gitdev-dual", []],
  [["test/_gitdev-alternate.yml"], "/test/gitdev-alternate", []],
  [["test/_tokens.yml"], "/test/tokens", ["--unpublished"]],
];

const shell = process.platform === "win32";
const run = (args, env = process.env) => execFileSync("bundle", args, { stdio: "inherit", shell, env });

// Each build uses a different configuration, which clears Jekyll's disk cache
// anyway, so skip it.
for (const [configs, path, flags] of builds) {
  const config = ["_config.yml", "test/_config.yml", ...configs, urlConfig].join(",");
  run(["exec", "jekyll", "build", "--config", config, ...flags, "--disable-disk-cache",
    "--baseurl", `/chulapa2${path}`, "--destination", `_site_test${path}`]);
}
run(["exec", "ruby", "scripts/build-skin-fixtures.rb"], { ...process.env, CHULAPA2_TEST_URL: url });
run(["exec", "jekyll", "serve", "--skip-initial-build", "--no-watch", "--host", "127.0.0.1",
  "--port", port, "--baseurl", "/chulapa2", "--destination", "_site_test"]);
