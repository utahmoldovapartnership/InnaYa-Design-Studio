/**
 * Fail the build if the Keystatic postinstall patch corrupted API route parsing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const distDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "@keystatic",
  "core",
  "dist",
);

const apiFiles = [
  "keystatic-core-api-generic.node.react-server.js",
  "keystatic-core-api-generic.node.js",
  "keystatic-core-api-generic.react-server.js",
  "keystatic-core-api-generic.js",
  "keystatic-core-api-generic.worker.js",
];

let failed = false;

for (const file of apiFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) continue;

  const source = fs.readFileSync(filePath, "utf8");

  if (source.includes("pathname.replace(/^\\/api\\/edit")) {
    console.error(
      `verify-keystatic-patch: ${file} still parses /api/edit instead of /api/keystatic`,
    );
    failed = true;
  }

  if (!source.includes("pathname.replace(/^\\/api\\/keystatic")) {
    console.error(
      `verify-keystatic-patch: ${file} is missing the /api/keystatic route parser`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("verify-keystatic-patch: OK");
