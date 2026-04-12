import { defineConfig, defineProject } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

const shared = {
  define: {
    __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
  },
};

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["@testing-library/jest-dom"],
    exclude: ["**/node_modules/**", "**/.claude/worktrees/**"],
    // The mixed DOM/SSR suite currently exhausts worker memory on Windows when
    // multiple files run in parallel. Run files serially until the suite is
    // split into explicit projects.
    fileParallelism: false,
    projects: [
      defineProject({
        ...shared,
        test: {
          name: "node",
          environment: "node",
          include: ["**/*.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/.claude/worktrees/**", "**/ui/**/*.test.{ts,tsx}"],
        },
      }),
      defineProject({
        ...shared,
        test: {
          name: "ui",
          environment: "happy-dom",
          include: ["**/ui/**/*.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/.claude/worktrees/**"],
        },
      }),
    ],
  },
});
