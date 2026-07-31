import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceCandidates = [
  "standalone.tsx",
  "standalone.ts",
  "component.tsx",
  "component.ts",
];

const sourceOverrides = new Map([
  ["button", "src/ui/button.ts"],
  ["card", "src/ui/card.ts"],
  ["emoji-picker", "src/ui/emoji-picker.ts"],
  ["gif-picker", "src/ui/gif-picker.ts"],
  ["input", "src/ui/input.ts"],
  ["link-embed", "src/ui/link-embed.ts"],
  ["markdown", "src/ui/markdown.ts"],
  ["rich-input", "src/ui/rich-input.ts"],
]);

function toPosix(path) {
  return path.replace(/\\/g, "/");
}

function declarationPath(sourcePath) {
  return `./${sourcePath
    .replace(/^src\//, "dist-types/")
    .replace(/\.(tsx?|mts|cts)$/, ".d.ts")}`;
}

/**
 * Canonical inventory for public per-component entries.
 *
 * A component directory is public when it has a standalone/component source
 * under `src/ui/components/<domain>/<name>`. `_base` is implementation-only.
 * Component names are intentionally flat; the inventory rejects collisions so
 * consumers get `@lastshotlabs/snapshot/ui/<name>` regardless of source domain.
 */
export function collectComponentEntries(repoRoot = defaultRepoRoot) {
  const componentsRoot = join(repoRoot, "src", "ui", "components");
  const entries = [];
  const seenNames = new Map();

  for (const domainEntry of readdirSync(componentsRoot, {
    withFileTypes: true,
  })) {
    if (!domainEntry.isDirectory() || domainEntry.name === "_base") continue;
    const domainDir = join(componentsRoot, domainEntry.name);

    for (const componentEntry of readdirSync(domainDir, {
      withFileTypes: true,
    })) {
      if (!componentEntry.isDirectory()) continue;
      const componentDir = join(domainDir, componentEntry.name);
      const sourceFile = sourceCandidates.find((candidate) =>
        existsSync(join(componentDir, candidate)),
      );
      if (!sourceFile) continue;

      const name = componentEntry.name;
      const previous = seenNames.get(name);
      if (previous) {
        throw new Error(
          `Component subpath collision for "${name}": ${previous} and ${componentDir}`,
        );
      }
      seenNames.set(name, componentDir);

      const discoveredSource = toPosix(
        relative(repoRoot, join(componentDir, sourceFile)),
      );
      const source = sourceOverrides.get(name) ?? discoveredSource;
      entries.push({
        name,
        domain: domainEntry.name,
        source,
        discoveredSource,
        exportKey: `./ui/${name}`,
        importPath: `./dist/ui/${name}.js`,
        requirePath: `./dist/ui/${name}.cjs`,
        typesPath: declarationPath(source),
      });
    }
  }

  return entries.sort((left, right) => left.name.localeCompare(right.name));
}

export function componentTsupEntries(repoRoot = defaultRepoRoot) {
  return Object.fromEntries(
    collectComponentEntries(repoRoot).map(({ name, source }) => [
      `ui/${name}`,
      source,
    ]),
  );
}

export function repoRootFrom(importMetaUrl) {
  return resolve(dirname(fileURLToPath(importMetaUrl)), "..");
}
