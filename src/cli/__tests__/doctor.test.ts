import { mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { runDoctor } from "../doctor";

const tempDirs: string[] = [];

async function consumer(): Promise<string> {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "snapshot-doctor-"));
  tempDirs.push(cwd);
  await writeFile(
    path.join(cwd, "package.json"),
    JSON.stringify({ dependencies: { "@lastshotlabs/snapshot": "^0.4.0" } }),
  );
  for (const [name, version] of [
    ["react", "19.2.0"],
    ["react-dom", "19.2.0"],
    ["@tanstack/react-query", "5.90.0"],
    ["@tanstack/react-router", "1.130.0"],
    ["jotai", "2.15.0"],
  ] as const) {
    const packageDir = path.join(cwd, "node_modules", name);
    await mkdir(packageDir, { recursive: true });
    await writeFile(
      path.join(packageDir, "package.json"),
      JSON.stringify({ version }),
    );
  }
  return cwd;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("runDoctor", () => {
  it("passes a public-registry consumer with aligned peers", async () => {
    const cwd = await consumer();
    const checks = runDoctor({ cwd, homeDir: cwd, env: {} });
    expect(checks.every((check) => check.status === "pass")).toBe(true);
  });

  it("finds dangling links and legacy peer lockfile configuration", async () => {
    const cwd = await consumer();
    await symlink(
      "../missing-snapshot",
      path.join(cwd, "node_modules", "snapshot-link"),
    );
    await writeFile(path.join(cwd, ".npmrc"), "legacy-peer-deps=true\n");
    const checks = runDoctor({ cwd, homeDir: cwd, env: {} });
    expect(checks.find((check) => check.id === "symlinks")?.status).toBe(
      "fail",
    );
    expect(
      checks.find((check) => check.id === "legacy-peer-deps")?.status,
    ).toBe("fail");
  });

  it("rejects an unauthenticated GitHub Packages scope mapping", async () => {
    const cwd = await consumer();
    await writeFile(
      path.join(cwd, ".npmrc"),
      "@lastshotlabs:registry=https://npm.pkg.github.com\n",
    );
    const checks = runDoctor({ cwd, homeDir: cwd, env: {} });
    expect(checks.find((check) => check.id === "registry")?.status).toBe(
      "fail",
    );
  });
});
