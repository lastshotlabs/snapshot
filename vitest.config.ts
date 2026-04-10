import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  define: {
    __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["@testing-library/jest-dom"],
    exclude: ["**/node_modules/**", "**/.claude/worktrees/**"],
    // The mixed DOM/SSR suite currently exhausts worker memory on Windows when
    // multiple files run in parallel. Run files serially until the suite is
    // split into explicit projects.
    fileParallelism: false,
    environmentMatchGlobs: [["**/ui/**/*.test.{ts,tsx}", "happy-dom"]],
  },
});
