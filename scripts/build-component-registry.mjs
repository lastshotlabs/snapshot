#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { collectComponentEntries, repoRootFrom } from "./component-entries.mjs";

const repoRoot = repoRootFrom(import.meta.url);
const uiRoot = path.join(repoRoot, "src", "ui");
const registryRoot = path.join(repoRoot, "dist", "registry");
const filesRoot = path.join(registryRoot, "files");
const sourceExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx"];
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s*)?["']([^"']+)["']/g;

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function resolveRelativeImport(importer, specifier) {
  const unresolved = path.resolve(path.dirname(importer), specifier);
  const candidates = [
    unresolved,
    ...sourceExtensions.map((extension) => `${unresolved}${extension}`),
    ...sourceExtensions.map((extension) =>
      path.join(unresolved, `index${extension}`),
    ),
  ];
  return candidates.find((candidate) => {
    if (!existsSync(candidate)) return false;
    return statSync(candidate).isFile();
  });
}

function sourceGraph(entryPath) {
  const files = new Set();
  const dependencies = new Set();
  const queue = [entryPath];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || files.has(current)) continue;
    if (!current.startsWith(`${uiRoot}${path.sep}`)) {
      throw new Error(`Registry source escaped src/ui: ${current}`);
    }
    files.add(current);
    const source = readFileSync(current, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier) continue;
      if (!specifier.startsWith(".")) {
        dependencies.add(
          specifier.startsWith("@")
            ? specifier.split("/").slice(0, 2).join("/")
            : specifier.split("/")[0],
        );
        continue;
      }
      const resolved = resolveRelativeImport(current, specifier);
      if (!resolved) {
        throw new Error(`Cannot resolve ${specifier} from ${current}`);
      }
      queue.push(resolved);
    }
  }

  return {
    files: [...files]
      .map((filePath) => toPosix(path.relative(uiRoot, filePath)))
      .sort(),
    dependencies: [...dependencies].sort(),
  };
}

rmSync(registryRoot, { recursive: true, force: true });
mkdirSync(filesRoot, { recursive: true });

const components = {};
const allFiles = new Set();
for (const component of collectComponentEntries(repoRoot)) {
  const entryPath = path.join(repoRoot, component.source);
  const graph = sourceGraph(entryPath);
  const entry = toPosix(path.relative(uiRoot, entryPath));
  components[component.name] = {
    entry,
    files: graph.files,
    dependencies: graph.dependencies,
  };
  for (const file of graph.files) allFiles.add(file);
}

for (const file of allFiles) {
  const destination = path.join(filesRoot, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(path.join(uiRoot, file), destination);
}

writeFileSync(
  path.join(registryRoot, "manifest.json"),
  `${JSON.stringify({ version: 1, components }, null, 2)}\n`,
);

console.log(
  `Built component source registry (${Object.keys(components).length} components, ${allFiles.size} shared files)`,
);
