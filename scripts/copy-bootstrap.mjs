import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const destination = join(process.argv[2], "assets", "bootstrap");
await mkdir(destination, { recursive: true });

const source = "node_modules/bootstrap";
const assets = [
  "dist/css/bootstrap.min.css",
  "dist/js/bootstrap.bundle.min.js",
  "LICENSE",
];

for (const asset of assets) {
  await copyFile(join(source, asset), join(destination, asset.split("/").at(-1)));
}
