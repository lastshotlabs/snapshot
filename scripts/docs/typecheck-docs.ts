import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

rmSync("apps/docs/.astro", { recursive: true, force: true });

const result = spawnSync(
  "bun",
  ["x", "astro", "check", "--root", "apps/docs", "--minimumSeverity", "warning"],
  {
    stdio: "inherit",
    encoding: "utf8",
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
