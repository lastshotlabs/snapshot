import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outDir = path.join(projectRoot, "dist-types");
const legacyUiTypes = [
  path.join(projectRoot, "dist", "ui.d.ts"),
  path.join(projectRoot, "dist", "ui.d.cts"),
];
const tscPath = path.join(
  projectRoot,
  "node_modules",
  "typescript",
  "bin",
  "tsc",
);

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
for (const legacyPath of legacyUiTypes) {
  if (existsSync(legacyPath)) {
    rmSync(legacyPath, { force: true });
  }
}

execFileSync(process.execPath, [tscPath, "-p", "tsconfig.ui-types.json"], {
  cwd: projectRoot,
  stdio: "inherit",
});
