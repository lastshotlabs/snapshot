import { defineConfig } from "tsup";
import pkg from "./package.json" with { type: "json" };

export default defineConfig([
  // Library build
  {
    entry: [
      "src/index.ts",
      "src/tokens/index.ts",
      "src/components/index.ts",
      "src/manifest/index.ts",
      "src/generation/index.ts",
    ],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
    external: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "jotai",
      "@unhead/react",
    ],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    async onSuccess() {
      const { copyFileSync, mkdirSync } = await import("node:fs");
      mkdirSync("dist", { recursive: true });
      copyFileSync("src/push/sw.js", "dist/sw.js");
    },
  },
  // CLI entry point
  {
    entry: {
      "cli/index": "src/cli/index.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: false,
    clean: false,
    target: "node20",
    platform: "node",
    bundle: true,
    noExternal: [],
    external: [
      "@oclif/core",
      "node:fs",
      "node:fs/promises",
      "node:path",
      "node:os",
      "node:child_process",
      "node:url",
      "node:process",
      "node:crypto",
    ],
    define: {
      __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
    },
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  // CLI commands
  {
    entry: {
      "cli/commands/init": "src/cli/commands/init.ts",
      "cli/commands/sync": "src/cli/commands/sync.ts",
      "cli/commands/generate": "src/cli/commands/generate.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: false,
    clean: false,
    target: "node20",
    platform: "node",
    bundle: true,
    noExternal: ["@clack/prompts"],
    external: [
      "@oclif/core",
      "node:fs",
      "node:fs/promises",
      "node:path",
      "node:os",
      "node:child_process",
      "node:url",
      "node:process",
      "node:crypto",
    ],
    define: {
      __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
    },
  },
  // Vite plugin build
  {
    entry: { vite: "src/vite/index.ts" },
    format: ["esm", "cjs"],
    outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
    dts: true,
    sourcemap: false,
    clean: false,
    target: "node20",
    platform: "node",
    bundle: true,
    noExternal: ["@clack/prompts"],
    external: [
      "vite",
      "node:fs",
      "node:fs/promises",
      "node:path",
      "node:os",
      "node:child_process",
      "node:url",
      "node:process",
      "node:crypto",
    ],
  },
]);
