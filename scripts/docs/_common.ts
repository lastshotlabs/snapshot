import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..", "..");
export const docsRoot = path.join(
  repoRoot,
  "apps",
  "docs",
  "src",
  "content",
  "docs",
);

export function repoPath(...segments: string[]): string {
  return path.join(repoRoot, ...segments);
}

export function ensureDir(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

export function writeDoc(relativePath: string, content: string): void {
  const filePath = path.join(docsRoot, relativePath);
  ensureDir(filePath);
  writeFileSync(filePath, `${content.trim()}\n`, "utf8");
}

export function relToRepo(filePath: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

/**
 * Whether a resolved declaration path belongs to API surface we document.
 *
 * Third-party `node_modules` types are excluded, but first-party
 * `@lastshotlabs/*` packages are not: snapshot re-exports a chunk of its public
 * API (actions, resources, tokens, refs) from `@lastshotlabs/frontend-contract`,
 * and those exports are just as public as the ones declared in `src/`.
 *
 * This used to be incidental — a tsconfig `paths` mapping pointed the package at
 * a sibling checkout, so it never looked like `node_modules` to begin with. That
 * mapping was removed (it made typecheck resolve against an uninstalled sibling
 * repo), which silently dropped ~40 re-exported symbols from the reference.
 */
export function isDocumentedSource(sourcePath: string): boolean {
  if (sourcePath === "unknown") return false;
  if (!sourcePath.includes("node_modules/")) return true;
  return sourcePath.includes("node_modules/@lastshotlabs/");
}

export function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n+/g, " ").trim();
}

export function markdownPage(
  title: string,
  description: string,
  body: string,
): string {
  return `---
title: ${title}
description: ${description}
draft: false
---

${body}`;
}
