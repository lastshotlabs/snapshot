import { defineConfig } from "tsup";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig([
  // SDK entry point
  {
    entry: ["src/index.ts"],
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
  // UI entry point (standalone components and tokens).
  //
  // The main `./ui` barrel re-exports every component. Subpath entries
  // below (`./ui/rich-input`, `./ui/emoji-picker`, `./ui/gif-picker`)
  // bundle just the slice they name, so consumers that import only one
  // surface don't drag the whole tree into their bundle. Each subpath
  // gets its own `dist/ui/<name>.{js,cjs}` produced by tsup.
  {
    entry: {
      ui: "src/ui.ts",
      "ui/rich-input": "src/ui/rich-input.ts",
      "ui/emoji-picker": "src/ui/emoji-picker.ts",
      "ui/gif-picker": "src/ui/gif-picker.ts",
      "ui/markdown": "src/ui/markdown.ts",
      "ui/link-embed": "src/ui/link-embed.ts",
      "ui/button": "src/ui/button.ts",
      "ui/card": "src/ui/card.ts",
      "ui/input": "src/ui/input.ts",
      "ui/icon": "src/ui/icon.ts",
    },
    format: ["esm", "cjs"],
    dts: false,
    sourcemap: true,
    clean: false,
    target: "es2022",
    external: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "jotai",
      "zod",
      "@unhead/react",
    ],
    esbuildOptions(options) {
      options.jsx = "automatic";
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
  // SSR entry point — runs in Node/Bun server context, NOT in browser
  {
    entry: { ssr: "src/ssr/index.ts" },
    format: ["esm", "cjs"],
    outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
    dts: true,
    sourcemap: true,
    clean: false,
    target: "es2022",
    platform: "node",
    bundle: true,
    external: [
      "react",
      "react-dom",
      "react-dom/server",
      "@tanstack/react-query",
      "jotai",
      "node:fs",
      "node:path",
    ],
    esbuildOptions(options) {
      options.jsx = "automatic";
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
      "@tailwindcss/vite",
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
