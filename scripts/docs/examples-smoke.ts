import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("bun", ["x", "vite", "build"], "playground");

const exampleNames = ["auth", "settings", "community-chat", "admin", "ssr"];
for (const name of exampleNames) {
  const manifest = JSON.parse(
    readFileSync(`examples/${name}/package.json`, "utf8"),
  ) as { dependencies?: Record<string, string> };
  const snapshotSpec = manifest.dependencies?.["@lastshotlabs/snapshot"];
  if (!snapshotSpec || /^(?:file|link|workspace):/.test(snapshotSpec)) {
    throw new Error(
      `examples/${name} must install @lastshotlabs/snapshot from a registry`,
    );
  }
}

run("npm", ["ci", "--ignore-scripts", "--no-legacy-peer-deps"], "examples");
run("npm", ["run", "build"], "examples");

console.log(
  `[examples:smoke] Built ${exampleNames.length} registry-installed examples.`,
);
