import { Command, Flags } from "@oclif/core";
import { intro, outro } from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { safeCompileManifest } from "../../ui/manifest/compiler";
import { snapshotApp } from "../../vite/index";

export default class Dev extends Command {
  static override description =
    "Start Snapshot's built-in Vite dev server from snapshot.manifest.json";
  static override aliases = ["start"];
  static override examples = [
    "<%= config.bin %> dev",
    "<%= config.bin %> start",
    "<%= config.bin %> dev --manifest ./snapshot.manifest.json --port 4173",
  ];
  static override flags = {
    manifest: Flags.string({
      char: "m",
      description: "Path to snapshot.manifest.json",
      default: "snapshot.manifest.json",
    }),
    apiUrl: Flags.string({
      description: "API URL passed through to ManifestApp",
    }),
    host: Flags.string({
      description: "Dev server host",
      default: "localhost",
    }),
    port: Flags.integer({
      description: "Dev server port",
      default: 5173,
    }),
    "strict-port": Flags.boolean({
      description: "Exit if the preferred port is already in use",
      default: false,
    }),
    open: Flags.boolean({
      description: "Open the browser automatically",
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Dev);
    const cwd = process.cwd();
    const manifestPath = path.resolve(cwd, flags.manifest);

    if (!fs.existsSync(manifestPath)) {
      this.error(
        `No manifest found at '${flags.manifest}'. Create one or use --manifest to point at a valid snapshot.manifest.json.`,
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.error(`Failed to load '${flags.manifest}': ${message}`);
    }

    const result = safeCompileManifest(raw);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `- ${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("\n");
      this.error(`Invalid snapshot.manifest.json:\n${issues}`);
    }

    const { createServer } = await import("vite");

    intro("@lastshotlabs/snapshot dev");

    const server = await createServer({
      root: cwd,
      appType: "custom",
      configFile: false,
      logLevel: "info",
      plugins: [
        snapshotApp({
          manifestFile: flags.manifest,
          apiUrl: flags.apiUrl,
        }),
      ],
      server: {
        host: flags.host,
        port: flags.port,
        strictPort: flags["strict-port"],
        open: flags.open,
      },
    });

    await server.listen();
    server.printUrls();

    outro("Snapshot dev server is running.");
  }
}
