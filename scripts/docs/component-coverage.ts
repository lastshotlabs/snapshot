import { readFileSync } from "node:fs";
import { collectComponentDirectories } from "./component-inventory.ts";
import { repoPath } from "./_common.ts";

const componentDocsPath = repoPath(
  "apps",
  "docs",
  "src",
  "content",
  "docs",
  "reference",
  "components.md",
);
const apiDocsPath = repoPath(
  "apps",
  "docs",
  "src",
  "content",
  "docs",
  "reference",
  "ui",
  "index.md",
);

const componentDocs = readFileSync(componentDocsPath, "utf8");
const apiDocs = readFileSync(apiDocsPath, "utf8");
const componentDirectories = collectComponentDirectories();

let hasError = false;
let documentedComponents = 0;

for (const directory of componentDirectories) {
  if (directory.hasComponent && !componentDocs.includes(`### \`${directory.relativeDir}\``)) {
    console.error(
      `[components:coverage] Missing component directory doc entry for ${directory.relativeDir}`,
    );
    hasError = true;
    continue;
  }

  if (directory.hasComponent) documentedComponents += 1;
}

if (/No JSDoc description|No description/i.test(apiDocs)) {
  console.error(
    `[components:coverage] Generated API reference still contains missing-description placeholders.`,
  );
  hasError = true;
}

if (hasError) {
  process.exit(1);
}

console.log(
  `[components:coverage] Verified ${documentedComponents} code-first component docs and generated UI API docs.`,
);
