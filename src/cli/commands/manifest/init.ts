import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as p from "@clack/prompts";
import { generateManifestJson } from "../../templates/manifest-init.js";

const DEFAULT_FLAVOR = "neutral";
const MANIFEST_FILENAME = "snapshot.manifest.json";

export default class ManifestInit extends Command {
  static override description = "Create a snapshot.manifest.json file";
  static override examples = [
    "<%= config.bin %> manifest init",
    "<%= config.bin %> manifest init --yes",
  ];
  static override flags = {
    yes: Flags.boolean({
      char: "y",
      description: "Skip prompts, use defaults",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ManifestInit);
    const skipPrompts = flags.yes ?? false;

    p.intro("@lastshotlabs/snapshot manifest init");

    const manifestPath = path.resolve(process.cwd(), MANIFEST_FILENAME);

    // Check for existing file
    if (fs.existsSync(manifestPath)) {
      if (skipPrompts) {
        p.log.warn(`Overwriting existing ${MANIFEST_FILENAME} (--yes flag).`);
      } else {
        const overwrite = await p.confirm({
          message: `${MANIFEST_FILENAME} already exists. Overwrite?`,
        });
        if (p.isCancel(overwrite) || !overwrite) {
          p.cancel("Manifest init cancelled.");
          process.exit(0);
        }
      }
    }

    let flavor = DEFAULT_FLAVOR;
    let includeAuth = true;
    let includeSidebar = true;

    if (!skipPrompts) {
      // Dynamic import so the flavor registry is populated
      const { getAllFlavors } = await import("../../../ui/tokens/flavors.js");
      const allFlavors = getAllFlavors();
      const flavorNames = Object.keys(allFlavors);

      const flavorChoice = await p.select({
        message: "Choose a theme flavor:",
        options: flavorNames.map((name) => ({
          value: name,
          label: allFlavors[name]?.displayName ?? name,
        })),
      });

      if (p.isCancel(flavorChoice)) {
        p.cancel("Manifest init cancelled.");
        process.exit(0);
      }

      flavor = flavorChoice as string;

      const features = await p.multiselect({
        message: "Include features:",
        options: [
          {
            value: "auth",
            label: "Auth screens (login, register)",
            hint: "recommended",
          },
          {
            value: "sidebar",
            label: "Sidebar navigation",
            hint: "recommended",
          },
        ],
        initialValues: ["auth", "sidebar"],
      });

      if (p.isCancel(features)) {
        p.cancel("Manifest init cancelled.");
        process.exit(0);
      }

      includeAuth = (features as string[]).includes("auth");
      includeSidebar = (features as string[]).includes("sidebar");
    }

    const content = generateManifestJson({
      flavor,
      includeAuth,
      includeSidebar,
    });

    fs.writeFileSync(manifestPath, content, "utf-8");

    p.log.success(`Created ${MANIFEST_FILENAME}`);
    p.outro(
      `Next: run \`snapshot manifest validate\` to verify your manifest.`,
    );
  }
}
