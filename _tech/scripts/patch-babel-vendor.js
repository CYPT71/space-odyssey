/* Ensures @babel/core has vendor/import-meta-resolve.js for Jest. */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "@babel",
  "core",
  "vendor",
  "import-meta-resolve.js"
);

try {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const shim = [
    "// Auto-generated shim to satisfy @babel/core vendor import-meta-resolve",
    "const mod = require('import-meta-resolve');",
    "exports.resolve = mod.resolve || mod;",
  ].join("\n");
  fs.writeFileSync(target, shim, "utf8");
  // eslint-disable-next-line no-console
  console.log(`[patch-babel-vendor] wrote ${target}`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn("[patch-babel-vendor] failed:", err);
}
