#!/usr/bin/env node
// Packs the real tarball and exercises it from clean throwaway consumers.
//
// This exists because `npm pack --dry-run` cannot catch dependency specifiers
// that only resolve from inside this repo. A `file:vendor/*.tgz` dependency
// packs and dry-runs happily, then fails for every downstream consumer with
// `ENOENT extracting tarball` — a `file:` specifier resolves relative to the
// CONSUMER's project root, not ours. That shipped once (0.1.4) and was
// invisible from inside the monorepo.
//
// It also guards the package boundary itself. Each consumer installs the
// packed artifact (never this checkout), imports the public entry points,
// typechecks against the shipped declarations, and builds where appropriate.
// That catches broken export maps, missing declaration files, and accidental
// runtime imports of optional peers before a release is created.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const workDir = mkdtempSync(join(tmpdir(), "snapshot-install-smoke-"));

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

const writeJson = (path, value) =>
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`\n✗ ${message}`);
};

const runStep = (label, cmd, args, cwd) => {
  process.stdout.write(`  • ${label}`);
  try {
    run(cmd, args, cwd);
    console.log(" ✓");
  } catch (error) {
    console.log();
    fail(`${label} failed:\n${error.stderr || error.stdout || error.message}`);
    throw error;
  }
};

const createConsumer = (name) => {
  const project = join(workDir, name);
  mkdirSync(project);
  writeJson(join(project, "package.json"), {
    name: `snapshot-${name}`,
    version: "1.0.0",
    private: true,
    type: "module",
  });
  return project;
};

const install = (project, packages) =>
  runStep(
    "install packed package",
    "npm",
    ["install", ...packages, "--no-audit", "--no-fund", "--no-package-lock"],
    project,
  );

try {
  console.log("• packing tarball");
  const packed = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", workDir], repoRoot),
  );
  const tarball = join(workDir, packed[0].filename);

  // Static check first — it names the exact offending dependency, which a bare
  // install failure does not.
  const manifest = JSON.parse(
    readFileSync(join(repoRoot, "package.json"), "utf8"),
  );
  for (const field of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (typeof spec === "string" && /^(file:|link:)/.test(spec)) {
        fail(
          `${field}.${name} is "${spec}" — a local path specifier cannot resolve for consumers`,
        );
      }
    }
  }

  const tool = (name) => `${name}@${manifest.devDependencies[name]}`;
  const reactTools = [
    tool("react"),
    tool("react-dom"),
    tool("@types/react"),
    tool("@types/react-dom"),
    tool("@types/node"),
  ];

  console.log("• bare Node ESM consumer");
  const nodeConsumer = createConsumer("node-esm-consumer");
  install(nodeConsumer, [
    tarball,
    tool("typescript"),
    tool("@types/node"),
    tool("@types/react"),
  ]);
  writeFileSync(
    join(nodeConsumer, "index.mjs"),
    `import { createSnapshot } from "@lastshotlabs/snapshot";
if (typeof createSnapshot !== "function") {
  throw new TypeError("createSnapshot export is not callable");
}
`,
  );
  writeFileSync(
    join(nodeConsumer, "index.ts"),
    `import { createSnapshot } from "@lastshotlabs/snapshot";
const snapshotFactory: typeof createSnapshot = createSnapshot;
void snapshotFactory;
`,
  );
  writeJson(join(nodeConsumer, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      lib: ["ES2022", "DOM"],
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    include: ["index.ts"],
  });
  runStep("import root ESM entry", "node", ["index.mjs"], nodeConsumer);
  runStep(
    "typecheck root declarations",
    "npm",
    ["exec", "tsc", "--", "--noEmit"],
    nodeConsumer,
  );

  // Prove the dependency graph actually materialized, not just that npm exited 0.
  for (const pkg of [
    "@lastshotlabs/snapshot",
    "@lastshotlabs/frontend-contract",
  ]) {
    const installed = join(nodeConsumer, "node_modules", pkg, "package.json");
    try {
      const { version } = JSON.parse(readFileSync(installed, "utf8"));
      console.log(`  ✓ ${pkg}@${version}`);
    } catch {
      fail(`${pkg} is missing from the consumer's node_modules after install`);
    }
  }

  const installedSnapshotRoot = join(
    nodeConsumer,
    "node_modules",
    "@lastshotlabs",
    "snapshot",
  );
  const installedManifest = JSON.parse(
    readFileSync(join(installedSnapshotRoot, "package.json"), "utf8"),
  );
  const componentExports = Object.entries(installedManifest.exports).filter(
    ([key]) =>
      key.startsWith("./ui/") && key !== "./ui/icon" && key !== "./ui/tokens",
  );
  for (const [key, conditions] of componentExports) {
    for (const [condition, target] of Object.entries(conditions)) {
      const installedTarget = join(
        installedSnapshotRoot,
        target.replace(/^\.\//, ""),
      );
      if (!existsSync(installedTarget)) {
        fail(
          `${key} ${condition} target is missing from the tarball: ${target}`,
        );
      }
    }
  }
  console.log(
    `  ✓ ${componentExports.length} UI export maps have shipped import, require, and type targets`,
  );

  const packagesExcludedFromMinimalInstall = [
    "@clack/prompts",
    "@codemirror/commands",
    "@codemirror/lang-markdown",
    "@codemirror/language",
    "@codemirror/language-data",
    "@codemirror/state",
    "@codemirror/view",
    "@dnd-kit/core",
    "@dnd-kit/sortable",
    "@dnd-kit/utilities",
    "@oclif/core",
    "@tiptap/core",
    "@tiptap/extension-link",
    "@tiptap/extension-mention",
    "@tiptap/extension-placeholder",
    "@tiptap/extension-underline",
    "@tiptap/pm",
    "@tiptap/react",
    "@tiptap/starter-kit",
    "highlight.js",
    "react-markdown",
    "rehype-highlight",
    "remark-gfm",
    "tiptap-markdown",
  ];
  const unexpectedlyInstalled = packagesExcludedFromMinimalInstall.filter(
    (name) => existsSync(join(nodeConsumer, "node_modules", name)),
  );
  if (unexpectedlyInstalled.length > 0) {
    fail(
      `minimal consumer unexpectedly installed optional UI/CLI packages: ${unexpectedlyInstalled.join(", ")}`,
    );
  } else {
    console.log(
      `  ✓ minimal install excludes ${packagesExcludedFromMinimalInstall.length} optional UI/CLI packages`,
    );
  }

  console.log("• CLI consumer");
  const cliConsumer = createConsumer("cli-consumer");
  install(cliConsumer, [
    tarball,
    tool("@oclif/core"),
    tool("@clack/prompts"),
    tool("vite"),
  ]);
  runStep(
    "run CLI with its optional peers",
    "node",
    [
      join(
        cliConsumer,
        "node_modules",
        "@lastshotlabs",
        "snapshot",
        "dist",
        "cli",
        "index.js",
      ),
      "--help",
    ],
    cliConsumer,
  );
  runStep(
    "import Vite plugin with its optional peers",
    "node",
    [
      "--input-type=module",
      "--eval",
      'const plugin = await import("@lastshotlabs/snapshot/vite"); if (typeof plugin.snapshotSync !== "function") throw new TypeError("missing snapshotSync");',
    ],
    cliConsumer,
  );

  console.log("• Vite + React consumer");
  const viteConsumer = createConsumer("vite-react-consumer");
  install(viteConsumer, [
    tarball,
    ...reactTools,
    tool("typescript"),
    tool("vite"),
    tool("@vitejs/plugin-react"),
    tool("jotai"),
  ]);
  mkdirSync(join(viteConsumer, "src"));
  writeFileSync(
    join(viteConsumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
  );
  writeFileSync(
    join(viteConsumer, "src", "main.tsx"),
    `import React from "react";
import { createRoot } from "react-dom/client";
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { ConfirmDialog } from "@lastshotlabs/snapshot/ui/confirm";
import { resolveTokens } from "@lastshotlabs/snapshot/ui/tokens";

const tokens = resolveTokens({ flavor: "neutral" });
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <style>{tokens}</style>
    <ButtonBase>Installed Snapshot</ButtonBase>
    <ConfirmDialog />
  </React.StrictMode>,
);
`,
  );
  writeFileSync(
    join(viteConsumer, "vite.config.ts"),
    `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [react()] });
`,
  );
  writeJson(join(viteConsumer, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ESNext", "DOM", "DOM.Iterable"],
      allowJs: false,
      skipLibCheck: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
    },
    include: ["src", "vite.config.ts"],
  });
  runStep(
    "typecheck UI subpath declarations",
    "npm",
    ["exec", "tsc", "--", "--noEmit"],
    viteConsumer,
  );
  runStep(
    "build Vite + React app",
    "npm",
    ["exec", "vite", "--", "build"],
    viteConsumer,
  );

  console.log("• SSR consumer");
  const ssrConsumer = createConsumer("ssr-consumer");
  install(ssrConsumer, [
    tarball,
    ...reactTools,
    tool("typescript"),
    tool("vite"),
  ]);
  mkdirSync(join(ssrConsumer, "src"));
  writeFileSync(
    join(ssrConsumer, "src", "server.tsx"),
    `import React from "react";
import { createReactRenderer } from "@lastshotlabs/snapshot/ssr";

export const renderer = createReactRenderer({
  resolveComponent: async () => () =>
    React.createElement("main", null, "Installed Snapshot SSR"),
});
`,
  );
  writeJson(join(ssrConsumer, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM"],
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
    },
    include: ["src"],
  });
  runStep(
    "import SSR ESM entry",
    "node",
    [
      "--input-type=module",
      "--eval",
      'const ssr = await import("@lastshotlabs/snapshot/ssr"); if (typeof ssr.createReactRenderer !== "function") throw new TypeError("missing createReactRenderer");',
    ],
    ssrConsumer,
  );
  runStep(
    "typecheck SSR declarations",
    "npm",
    ["exec", "tsc", "--", "--noEmit"],
    ssrConsumer,
  );
  runStep(
    "build SSR entry",
    "npm",
    ["exec", "vite", "--", "build", "--ssr", "src/server.tsx"],
    ssrConsumer,
  );
} catch (error) {
  if (!failed) fail(error.message);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

if (failed) {
  console.error(
    "\ninstall smoke test FAILED — the published package would not work for clean consumers",
  );
  process.exit(1);
}

console.log("\n✓ installed-consumer matrix passed");
