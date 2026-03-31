import { cancel, intro, log, outro } from "@clack/prompts";
import { Args, Command, Flags } from "@oclif/core";
import path from "node:path";
import process from "node:process";
import { runPrompts } from "../prompts.js";
import { scaffold } from "../scaffold.js";
import { scaffoldAdmin } from "../scaffoldAdmin.js";
import { slugify } from "../utils.js";

export default class Init extends Command {
  static override description = "Scaffold a new Snapshot application";
  static override examples = [
    "<%= config.bin %> init my-app",
    "<%= config.bin %> init my-app ./apps/my-app --yes",
    "<%= config.bin %> init my-app --template admin",
  ];
  static override args = {
    name: Args.string({ description: "Project name" }),
    dir: Args.string({ description: "Output directory" }),
  };
  static override flags = {
    yes: Flags.boolean({
      char: "y",
      description: "Skip prompts, use defaults",
    }),
    template: Flags.string({ description: "Template name (e.g. admin)" }),
    manifest: Flags.string({
      char: "m",
      description:
        "Path to a manifest JSON file — scaffolds project from manifest instead of prompts",
    }),
    "no-git": Flags.boolean({ description: "Skip git init" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Init);

    const projectNameArg = args.name;
    const outputDirArg = args.dir;
    const skipPrompts = flags.yes ?? false;
    const templateArg = flags.template;
    const noGit = flags["no-git"] ?? false;

    intro("@lastshotlabs/snapshot init");

    // ── Manifest-driven scaffolding ──────────────────────────────────────────
    if (flags.manifest) {
      const fs = await import("node:fs/promises");
      const manifestPath = path.resolve(process.cwd(), flags.manifest);

      let rawManifest: unknown;
      try {
        const content = await fs.readFile(manifestPath, "utf8");
        rawManifest = JSON.parse(content);
      } catch (err) {
        log.error(err instanceof Error ? err.message : `Failed to read ${manifestPath}`);
        process.exit(1);
      }

      const { frontendManifestSchema } = await import("../../manifest/schema");
      const parsed = frontendManifestSchema.safeParse(rawManifest);
      if (!parsed.success) {
        log.error("Invalid manifest:");
        for (const issue of parsed.error.issues) {
          log.error(`  ${issue.path.join(".")}: ${issue.message}`);
        }
        process.exit(1);
      }

      const manifest = parsed.data;
      const projectName = projectNameArg ?? manifest.meta?.name ?? "my-snapshot-app";
      const packageName = slugify(projectName);
      const dir = outputDirArg
        ? path.resolve(process.cwd(), outputDirArg)
        : path.join(process.cwd(), packageName);

      log.info(
        `Scaffolding from manifest: ${projectName} in ${path.relative(process.cwd(), dir) || dir}`,
      );

      // Generate app files from manifest
      const { generateApp } = await import("../../generation/generator");
      const { generateSnapshotConfig } = await import("../../generation/config");

      const genResult = generateApp(rawManifest, { skipAudits: true });
      if (!genResult.success) {
        log.error("Generation failed:");
        for (const err of genResult.errors) log.error(`  ${err}`);
        process.exit(1);
      }

      // ── Write app shell ───────────────────────────────────────────────────
      await fs.mkdir(dir, { recursive: true });

      // package.json
      const pkgJson = {
        name: packageName,
        private: true,
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          generate: `snapshot generate --manifest app.manifest.json --out src/generated`,
        },
        dependencies: {
          "@lastshotlabs/snapshot": "^0.1.0",
          "@tanstack/react-query": "^5.0.0",
          "@tanstack/react-router": "^1.114.0",
          jotai: "^2.0.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          zod: "^3.0.0",
        },
        devDependencies: {
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          typescript: "^5.0.0",
          vite: "^6.0.0",
          "@vitejs/plugin-react": "^4.0.0",
        },
      };
      await fs.writeFile(
        path.join(dir, "package.json"),
        JSON.stringify(pkgJson, null, 2) + "\n",
        "utf8",
      );
      log.success("package.json");

      // tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          paths: { "@generated/*": ["./src/generated/*"] },
        },
        include: ["src"],
      };
      await fs.writeFile(
        path.join(dir, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2) + "\n",
        "utf8",
      );
      log.success("tsconfig.json");

      // vite.config.ts
      const viteConfig = `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@generated": path.resolve(__dirname, "src/generated"),
    },
  },
})
`;
      await fs.writeFile(path.join(dir, "vite.config.ts"), viteConfig, "utf8");
      log.success("vite.config.ts");

      // index.html
      const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="/src/generated/theme.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
      await fs.writeFile(path.join(dir, "index.html"), indexHtml, "utf8");
      log.success("index.html");

      // src/main.tsx
      await fs.mkdir(path.join(dir, "src"), { recursive: true });
      const mainTsx = `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider as JotaiProvider } from "jotai"
import { AppRoot, componentRegistry, manifestRegistry } from "./generated/app"

// ── Register custom components, guards, and layouts here ─────────────────────
// These run before AppRoot renders, so all manifest references resolve correctly.
//
// Example: custom component
//   import { MyWidget } from "./components/MyWidget"
//   import { myWidgetSchema } from "./components/MyWidget.schema"
//   componentRegistry.register("my-widget", MyWidget, myWidgetSchema)
//
// Example: custom guard
//   manifestRegistry.register("guard", "admin-only", () => async ({ context }) => {
//     const roles = context.getUserRoles()
//     if (!roles.includes("admin")) throw redirect({ to: "/403" })
//   })
//
// Example: custom layout
//   import { DashboardLayout } from "./layouts/DashboardLayout"
//   import { dashboardLayoutSchema } from "./layouts/DashboardLayout.schema"
//   componentRegistry.register("dashboard-layout", DashboardLayout, dashboardLayoutSchema)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JotaiProvider>
      <AppRoot />
    </JotaiProvider>
  </StrictMode>,
)
`;
      await fs.writeFile(path.join(dir, "src/main.tsx"), mainTsx, "utf8");
      log.success("src/main.tsx");

      // ── Write generated files ──────────────────────────────────────────────
      const genDir = path.join(dir, "src/generated");
      await fs.mkdir(genDir, { recursive: true });

      for (const [filename, content] of Object.entries(genResult.files)) {
        const filePath = path.join(genDir, filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, "utf8");
        log.success(path.relative(process.cwd(), filePath));
      }

      // ── Write snapshot.config.ts (imported by generated app.ts) ────────────
      const manifestRelPath = path
        .relative(genDir, path.join(dir, "app.manifest.json"))
        .replace(/\\/g, "/");
      const configTs = `// Generated by @lastshotlabs/snapshot. Do not edit manually.
import { createSnapshot } from "@lastshotlabs/snapshot"
import { generateSnapshotConfig } from "@lastshotlabs/snapshot/generation"
import manifest from "${manifestRelPath.startsWith(".") ? manifestRelPath : "./" + manifestRelPath}"

const { coreConfig, plugins } = generateSnapshotConfig(manifest)
export const app = createSnapshot(coreConfig, ...plugins)
`;
      await fs.writeFile(path.join(genDir, "snapshot.config.ts"), configTs, "utf8");
      log.success(path.relative(process.cwd(), path.join(genDir, "snapshot.config.ts")));

      // ── Copy manifest + write .env ─────────────────────────────────────────
      await fs.copyFile(manifestPath, path.join(dir, "app.manifest.json"));
      log.success("app.manifest.json");

      const { coreConfig } = generateSnapshotConfig(manifest);
      const envLines = [`VITE_API_URL=${coreConfig.apiUrl}`];
      if (manifest.ws) envLines.push(`VITE_WS_URL=${manifest.ws.url}`);
      await fs.writeFile(path.join(dir, ".env"), envLines.join("\n") + "\n", "utf8");
      log.success(".env");

      const relDir = path.relative(process.cwd(), dir);
      outro(
        `${projectName} scaffolded from manifest\n\n  Next steps:\n\n  cd ${relDir}\n  bun install\n  bun dev\n\n  To regenerate: bun run generate`,
      );
      return;
    }

    if (templateArg === "admin") {
      const projectName = projectNameArg ?? "my-admin-app";
      const packageName = slugify(projectName);
      const dir = outputDirArg
        ? path.resolve(process.cwd(), outputDirArg)
        : path.join(process.cwd(), packageName);

      const adminConfig = {
        projectName,
        packageName,
        dir,
        webhookAdminPages: false,
        gitInit: !noGit,
      };

      log.info(
        `Scaffolding admin app: ${projectName} in ${path.relative(process.cwd(), dir) || dir}`,
      );
      await scaffoldAdmin(adminConfig);

      const relDir = path.relative(process.cwd(), dir);
      outro(
        `${projectName} (admin) scaffolded successfully\n\n  Next steps:\n\n  cd ${relDir}\n\n  Fill in your .env:\n    VITE_API_URL — your bunshot backend URL\n\n  bun dev       — start the dev server\n\n  Note: TypeScript will show an error for routeTree.gen.ts until you run bun dev once.\n\n  Docs: github.com/lastshotlabs/snapshot`,
      );
      return;
    }

    const config = await runPrompts({
      projectNameArg,
      outputDirArg,
      skipPrompts,
    });

    if (!config) {
      cancel("Scaffold cancelled.");
      process.exit(0);
    }

    log.info(
      `Initialising ${config.projectName} in ${path.relative(process.cwd(), config.dir) || config.dir}`,
    );

    await scaffold(config);

    const relDir = path.relative(process.cwd(), config.dir);
    const wsLine = config.webSocket
      ? `    VITE_WS_URL       — full WebSocket endpoint URL (e.g. ws://host/chat)\n`
      : "";
    const bearerLine =
      config.securityProfile === "prototype"
        ? `    VITE_BEARER_TOKEN — your API bearer token (prototype mode)\n`
        : "";
    const mailLine = config.mailPlugin
      ? `\n  bunshot-mail plugin config scaffolded to:\n    ${path.join(relDir, "server-plugins/mail.ts")}\n  Copy it into your bunshot backend and add RESEND_API_KEY to your backend .env.\n`
      : "";

    outro(
      `${config.projectName} initialised successfully\n\n  Next steps:\n\n  cd ${relDir}\n\n  Fill in your .env:\n    VITE_API_URL      — your bunshot backend URL\n${bearerLine}${wsLine}\n  bun dev            — start the dev server\n  bun run sync       — generate typed API hooks (auto-runs on bun dev when schema.json exists)\n${mailLine}\n  Note: TypeScript will show an error for routeTree.gen.ts until you run bun dev once.\n\n  Docs: github.com/lastshotlabs/snapshot`,
    );
  }
}
