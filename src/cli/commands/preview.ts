import { Command, Flags } from "@oclif/core";
import { intro, outro } from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { safeCompileManifest } from "../../ui/manifest/compiler";

export default class Preview extends Command {
  static override description =
    "Preview a built Snapshot app from the local dist output";
  static override examples = [
    "<%= config.bin %> preview",
    "<%= config.bin %> preview --manifest ./snapshot.manifest.json",
    "<%= config.bin %> preview --port 4173",
  ];
  static override flags = {
    manifest: Flags.string({
      char: "m",
      description: "Path to snapshot.manifest.json",
      default: "snapshot.manifest.json",
    }),
    host: Flags.string({
      description: "Preview server host",
      default: "localhost",
    }),
    port: Flags.integer({
      description: "Preview server port",
      default: 4173,
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
    const { flags } = await this.parse(Preview);
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

    const { preview } = await import("vite");

    intro("@lastshotlabs/snapshot preview");

    const server = await preview({
      root: cwd,
      appType: "custom",
      configFile: false,
      logLevel: "info",
      preview: {
        host: flags.host,
        port: flags.port,
        strictPort: flags["strict-port"],
        open: flags.open,
      },
    });

    server.printUrls();

    outro("Snapshot preview server is running.");
  }
}
