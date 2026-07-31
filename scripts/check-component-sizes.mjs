#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { collectComponentEntries, repoRootFrom } from "./component-entries.mjs";

const repoRoot = repoRootFrom(import.meta.url);
const maxBytes = 256 * 1024;
const importPattern = /(?:from\s*|import\s*)["'](\.[^"']+)["']/g;

function collectEsmClosure(entryPath, seen = new Set()) {
  const absolutePath = resolve(entryPath);
  if (seen.has(absolutePath)) return seen;
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing built entry or chunk: ${absolutePath}`);
  }

  seen.add(absolutePath);
  const source = readFileSync(absolutePath, "utf8");
  for (const match of source.matchAll(importPattern)) {
    let importedPath = resolve(dirname(absolutePath), match[1]);
    if (!/\.[cm]?js$/.test(importedPath)) importedPath += ".js";
    collectEsmClosure(importedPath, seen);
  }
  return seen;
}

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
const failures = [];
const results = [];

for (const entry of collectComponentEntries(repoRoot)) {
  const esmFiles = collectEsmClosure(resolve(repoRoot, entry.importPath));
  const esmBytes = [...esmFiles].reduce(
    (total, path) => total + statSync(path).size,
    0,
  );
  const cjsPath = resolve(repoRoot, entry.requirePath);
  if (!existsSync(cjsPath)) throw new Error(`Missing CJS entry: ${cjsPath}`);
  const cjsBytes = statSync(cjsPath).size;

  results.push({ name: entry.name, esmBytes, cjsBytes });
  if (esmBytes > maxBytes || cjsBytes > maxBytes) {
    failures.push(
      `${entry.exportKey}: ESM ${formatBytes(esmBytes)}, CJS ${formatBytes(cjsBytes)}`,
    );
  }
}

const largest = results
  .sort(
    (left, right) =>
      Math.max(right.esmBytes, right.cjsBytes) -
      Math.max(left.esmBytes, left.cjsBytes),
  )
  .slice(0, 5);

console.log(
  `Checked ${results.length} component entries (maximum ${formatBytes(maxBytes)} per ESM closure or CJS entry)`,
);
for (const result of largest) {
  console.log(
    `  ${result.name}: ESM ${formatBytes(result.esmBytes)}, CJS ${formatBytes(result.cjsBytes)}`,
  );
}

if (failures.length > 0) {
  console.error("\nComponent size budget exceeded:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
