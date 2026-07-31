#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = join(
  repoRoot,
  "src/ui/components/__tests__/contract-baseline.json",
);
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const minimum = 40;
// The ratchet starts after the one-time repository formatting sweep and the
// initial executable baseline landed. Earlier component diffs are deliberately
// outside the "every component touched from now on" rule.
const ratchetStart = "9382a47";
const errors = [];

if (!Array.isArray(baseline)) {
  errors.push("component contract baseline must be an array");
} else {
  if (baseline.length < minimum) {
    errors.push(
      `component contract baseline fell below ${minimum}: ${baseline.length}`,
    );
  }

  const unique = new Set(baseline);
  if (unique.size !== baseline.length) {
    errors.push("component contract baseline contains duplicate paths");
  }

  for (const path of baseline) {
    if (
      typeof path !== "string" ||
      !/^src\/ui\/components\/.+\/(standalone|component)\.tsx$/.test(path)
    ) {
      errors.push(`invalid component contract path: ${String(path)}`);
      continue;
    }
    if (!existsSync(join(repoRoot, path))) {
      errors.push(`component contract path does not exist: ${path}`);
    }
  }
}

function hasColocatedTest(componentPath) {
  const testsDir = join(repoRoot, dirname(componentPath), "__tests__");
  if (!existsSync(testsDir)) return false;
  return readdirSync(testsDir, { recursive: true }).some(
    (entry) => typeof entry === "string" && /\.test\.(ts|tsx)$/.test(entry),
  );
}

const base = process.env.COMPONENT_TEST_BASE?.trim();
if (base && !/^0+$/.test(base)) {
  let comparisonBase = base;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", base, ratchetStart], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    comparisonBase = ratchetStart;
  } catch {
    // The supplied base is already at or after the ratchet start.
  }

  let changed = [];
  try {
    changed = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", comparisonBase, "HEAD"],
      { cwd: repoRoot, encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch (error) {
    errors.push(
      `could not compare component changes with ${comparisonBase}: ${error.stderr || error.message}`,
    );
  }

  for (const path of changed.filter((candidate) =>
    /^src\/ui\/components\/.+\/(standalone|component)\.tsx$/.test(candidate),
  )) {
    if (!baseline.includes(path) && !hasColocatedTest(path)) {
      errors.push(
        `${path} changed without catalog-contract coverage or a colocated test`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Component test coverage check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Component test coverage: ${baseline.length} catalog components (minimum ${minimum})`,
);
if (base) {
  console.log(
    `Changed-component ratchet checked for CI base ${base} (introduced at ${ratchetStart})`,
  );
}
