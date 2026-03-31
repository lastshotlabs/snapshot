import { intro, log, outro, spinner } from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export default class Generate extends Command {
  static override description = "Generate a React app from a frontend manifest file";
  static override examples = [
    "<%= config.bin %> generate --manifest app.manifest.json",
    "<%= config.bin %> generate --manifest app.manifest.json --env production",
    "<%= config.bin %> generate --manifest app.manifest.json --out src/generated",
  ];
  static override flags = {
    manifest: Flags.string({
      char: "m",
      description: "Path to the manifest JSON file",
      required: true,
    }),
    out: Flags.string({
      char: "o",
      description: "Output directory for generated files",
      default: "src/generated",
    }),
    env: Flags.string({
      char: "e",
      description: "Environment name for config overrides",
    }),
    "skip-constraints": Flags.boolean({
      description: "Skip constraint checking",
    }),
    "skip-audits": Flags.boolean({
      description: "Skip audit checks",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Generate);
    intro("@lastshotlabs/snapshot generate");

    const cwd = process.cwd();
    const manifestPath = path.resolve(cwd, flags.manifest);
    const outDir = path.resolve(cwd, flags.out);

    // ── Load manifest ──────────────────────────────────────────────────────
    const sp = spinner();
    sp.start("Reading manifest...");

    let rawManifest: unknown;
    try {
      const content = await fs.readFile(manifestPath, "utf8");
      rawManifest = JSON.parse(content);
      sp.stop(`Manifest loaded: ${manifestPath}`);
    } catch (err) {
      sp.stop("Failed");
      log.error(err instanceof Error ? err.message : `Failed to read ${manifestPath}`);
      this.exit(1);
    }

    // ── Run generation pipeline ────────────────────────────────────────────
    sp.start("Generating app...");

    // Dynamic import to avoid loading generation code when not needed
    const { generateApp } = await import("../../generation/generator");

    const result = generateApp(rawManifest, {
      skipConstraints: flags["skip-constraints"],
      skipAudits: flags["skip-audits"],
    });

    if (!result.success) {
      sp.stop("Generation failed");
      for (const err of result.errors) {
        log.error(err);
      }
      this.exit(1);
    }

    sp.stop(`Generated ${Object.keys(result.files).length} files`);

    // ── Show warnings ──────────────────────────────────────────────────────
    if (result.constraintWarnings.length > 0) {
      for (const w of result.constraintWarnings) {
        log.warn(w);
      }
    }

    const auditErrors = result.auditResults.filter((r) => r.severity === "error");
    const auditWarnings = result.auditResults.filter((r) => r.severity === "warning");
    const auditInfo = result.auditResults.filter((r) => r.severity === "info");

    if (auditErrors.length > 0) {
      for (const a of auditErrors) {
        log.error(`[${a.ruleId}] ${a.message}${a.path ? ` at ${a.path}` : ""}`);
        if (a.suggestion) log.info(`  → ${a.suggestion}`);
      }
    }
    if (auditWarnings.length > 0) {
      for (const a of auditWarnings) {
        log.warn(`[${a.ruleId}] ${a.message}${a.path ? ` at ${a.path}` : ""}`);
        if (a.suggestion) log.info(`  → ${a.suggestion}`);
      }
    }
    if (auditInfo.length > 0) {
      for (const a of auditInfo) {
        log.info(`[${a.ruleId}] ${a.message}${a.path ? ` at ${a.path}` : ""}`);
      }
    }

    // ── Write files ────────────────────────────────────────────────────────
    sp.start("Writing files...");

    await fs.mkdir(outDir, { recursive: true });

    for (const [filename, content] of Object.entries(result.files)) {
      const filePath = path.join(outDir, filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf8");
    }

    sp.stop("Files written");

    // ── Summary ────────────────────────────────────────────────────────────
    for (const filename of Object.keys(result.files).sort()) {
      const rel = path.relative(cwd, path.join(outDir, filename));
      log.success(rel);
    }

    // ── Generate runtime config ─────────────────────────────────────────────
    // Emit a config file that uses generateSnapshotConfig at runtime.
    // The manifest is the source of truth — we don't reverse-engineer plugin constructors.
    const configPath = path.join(outDir, "snapshot.config.ts");
    const envArg = flags.env ? `  { environment: "${flags.env}" },\n` : "";

    // Compute relative import path from the config file to the manifest
    let manifestImportPath = path
      .relative(path.dirname(configPath), manifestPath)
      .replace(/\\/g, "/");
    if (!manifestImportPath.startsWith(".")) manifestImportPath = "./" + manifestImportPath;

    const configContent = [
      "// Generated by @lastshotlabs/snapshot. Do not edit manually.",
      "//",
      "// This file reads the manifest and produces the runtime config.",
      `// To regenerate: snapshot generate --manifest ${flags.manifest}`,
      "",
      'import { createSnapshot } from "@lastshotlabs/snapshot"',
      'import { generateSnapshotConfig } from "@lastshotlabs/snapshot/generation"',
      `import manifest from "${manifestImportPath}"`,
      "",
      `const { coreConfig, plugins } = generateSnapshotConfig(`,
      "  manifest,",
      envArg + ")",
      "",
      "export const app = createSnapshot(coreConfig, ...plugins)",
      "",
    ].join("\n");

    await fs.writeFile(configPath, configContent, "utf8");
    const configRel = path.relative(cwd, configPath);
    log.success(configRel);

    outro("Generation complete");
  }
}
