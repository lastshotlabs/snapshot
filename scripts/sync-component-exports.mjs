#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { collectComponentEntries, repoRootFrom } from "./component-entries.mjs";

const repoRoot = repoRootFrom(import.meta.url);
const manifestPath = join(repoRoot, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const current = manifest.exports ?? {};

const generated = Object.fromEntries(
  collectComponentEntries(repoRoot).map((entry) => [
    entry.exportKey,
    {
      types: entry.typesPath,
      import: entry.importPath,
      require: entry.requirePath,
    },
  ]),
);

manifest.exports = {
  ".": current["."],
  "./ui": current["./ui"],
  ...generated,
  "./ui/icon": current["./ui/icon"],
  "./vite": current["./vite"],
  "./ssr": current["./ssr"],
};

const next = `${JSON.stringify(manifest, null, 2)}\n`;
const existing = readFileSync(manifestPath, "utf8");
const mode = process.argv[2] ?? "--check";

if (mode === "--write") {
  if (existing !== next) writeFileSync(manifestPath, next);
  console.log(
    `Synced ${Object.keys(generated).length} component exports in package.json`,
  );
} else if (mode === "--check") {
  if (existing !== next) {
    console.error(
      "package.json component exports are stale. Run npm run components:exports:sync",
    );
    process.exit(1);
  }
  console.log(
    `Component exports are current (${Object.keys(generated).length} entries)`,
  );
} else {
  throw new Error(`Unknown mode ${mode}; expected --check or --write`);
}
