import { Command, Flags } from "@oclif/core";
import { intro, outro } from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { safeCompileManifest } from "../../ui/manifest/compiler";
import { snapshotApp } from "../../vite/index";

export default class Build extends Command {
  static override description =
    "Build a Snapshot app from snapshot.manifest.json using Vite";
  static override examples = [
    "<%= config.bin %> build",
    "<%= config.bin %> build --manifest ./snapshot.manifest.json",
    "<%= config.bin %> build --api-url https://api.example.com",
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
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Build);
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

    const { build } = await import("vite");

    intro("@lastshotlabs/snapshot build");

    await build({
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
    });

    outro("Snapshot build complete.");
  }
}
