import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { repoPath } from "./_common.ts";

export interface ComponentDirectoryRecord {
  domain: string;
  componentName: string;
  relativeDir: string;
  absoluteDir: string;
  hasComponent: boolean;
  hasSchema: boolean;
  hasComponentTest: boolean;
  hasSchemaTest: boolean;
}

function walkComponentDirs(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "__tests__") {
        continue;
      }
      walkComponentDirs(fullPath, results);
      continue;
    }

    if (entry === "index.ts" || entry === "index.tsx") {
      results.push(path.dirname(fullPath));
    }
  }

  return results;
}

export function collectComponentDirectories(): ComponentDirectoryRecord[] {
  const componentsRoot = repoPath("src", "ui", "components");
  const dirs = walkComponentDirs(componentsRoot);

  return dirs
    .map((absoluteDir) => {
      const relativeDir = path.relative(componentsRoot, absoluteDir).replace(/\\/g, "/");
      const [domain, ...parts] = relativeDir.split("/");
      const componentName = parts.join("/");
      const testsDir = path.join(absoluteDir, "__tests__");
      const tests = statIfExists(testsDir)?.isDirectory()
        ? readdirSync(testsDir)
        : [];

      return {
        domain: domain ?? "",
        componentName,
        relativeDir,
        absoluteDir,
        hasComponent:
          fileExists(path.join(absoluteDir, "standalone.tsx")) ||
          fileExists(path.join(absoluteDir, "standalone.ts")) ||
          fileExists(path.join(absoluteDir, "component.tsx")) ||
          fileExists(path.join(absoluteDir, "component.ts")),
        hasSchema: fileExists(path.join(absoluteDir, "schema.ts")),
        hasComponentTest: tests.some((name) =>
          /component\.test\.(ts|tsx)$/.test(name),
        ),
        hasSchemaTest: tests.some((name) => /schema\.test\.(ts|tsx)$/.test(name)),
      } satisfies ComponentDirectoryRecord;
    })
    .filter((record) => Boolean(record.domain) && Boolean(record.componentName))
    .sort((left, right) => left.relativeDir.localeCompare(right.relativeDir));
}

function fileExists(filePath: string): boolean {
  return Boolean(statIfExists(filePath));
}

function statIfExists(filePath: string) {
  try {
    return statSync(filePath);
  } catch {
    return null;
  }
}
