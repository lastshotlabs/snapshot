#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const workflowsDir = path.join(repoRoot, ".github", "workflows");
const workflowFiles = readdirSync(workflowsDir).filter((name) =>
  /\.ya?ml$/.test(name),
);
const publishers = workflowFiles.filter((name) =>
  /\bnpm publish\b/.test(readFileSync(path.join(workflowsDir, name), "utf8")),
);

const errors = [];
if (publishers.length !== 1 || publishers[0] !== "release.yml") {
  errors.push(
    `npm publish must exist only in release.yml; found: ${publishers.join(", ") || "none"}`,
  );
}

const release = readFileSync(path.join(workflowsDir, "release.yml"), "utf8");
for (const required of [
  "id-token: write",
  "googleapis/release-please-action@v4",
  "npm run release:check",
  "--provenance",
  "registry=https://registry.npmjs.org",
]) {
  if (!release.includes(required)) {
    errors.push(
      `release.yml is missing required publishing control: ${required}`,
    );
  }
}
if (/NPM_TOKEN/.test(release)) {
  errors.push("release.yml must not use a long-lived public npm token");
}

const manifest = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8"),
);
if (
  manifest.repository?.url !==
  "git+https://github.com/lastshotlabs/snapshot.git"
) {
  errors.push(
    "package.json repository.url must exactly identify the OIDC repository",
  );
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[release:config] ${error}`);
  process.exit(1);
}

console.log("[release:config] Release PR + OIDC publishing path is locked.");
