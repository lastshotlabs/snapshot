import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { intro, log, outro } from "@clack/prompts";

export default class ManifestValidate extends Command {
  static override description = "Validate a snapshot.manifest.json file";
  static override examples = [
    "<%= config.bin %> manifest validate",
    "<%= config.bin %> manifest validate --path ./custom-manifest.json",
  ];
  static override flags = {
    path: Flags.string({
      description: "Path to manifest file",
      default: "snapshot.manifest.json",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ManifestValidate);
    const manifestPath = path.resolve(process.cwd(), flags.path);

    intro("@lastshotlabs/snapshot manifest validate");

    if (!fs.existsSync(manifestPath)) {
      log.error(`File not found: ${flags.path}`);
      outro("Validation failed.");
      this.exit(1);
      return;
    }

    let raw: string;
    try {
      raw = fs.readFileSync(manifestPath, "utf-8");
    } catch {
      log.error(`Could not read file: ${flags.path}`);
      outro("Validation failed.");
      this.exit(1);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      log.error("File is not valid JSON.");
      outro("Validation failed.");
      this.exit(1);
      return;
    }

    // Dynamic import so the schema registry is initialized
    const { manifestConfigSchema } =
      await import("../../../ui/manifest/schema.js");

    const result = manifestConfigSchema.safeParse(parsed);

    if (result.success) {
      const data = result.data as {
        pages?: Record<string, unknown>;
        nav?: unknown[];
        theme?: { flavor?: string };
      };
      const pageCount = Object.keys(data.pages ?? {}).length;
      const navCount = Array.isArray(data.nav) ? data.nav.length : 0;
      const flavor = data.theme?.flavor ?? "(none)";

      log.success("Manifest is valid.");
      log.info(`Pages: ${pageCount}`);
      log.info(`Nav items: ${navCount}`);
      log.info(`Flavor: ${flavor}`);
      outro("Validation passed.");
    } else {
      log.error("Manifest validation failed:");
      for (const issue of result.error.issues) {
        const pathStr = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        log.error(`  ${pathStr}: ${issue.message}`);
      }
      outro("Validation failed.");
      this.exit(1);
    }
  }
}
