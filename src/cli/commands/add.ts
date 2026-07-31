import { Args, Command, Flags } from "@oclif/core";
import { addComponent, listComponents } from "../add.js";

export default class Add extends Command {
  static override description =
    "Copy a Snapshot component and its source dependencies into your app";
  static override examples = [
    "<%= config.bin %> add button",
    "<%= config.bin %> add confirm-dialog --path src/ui/snapshot",
    "<%= config.bin %> add --list",
  ];
  static override args = {
    component: Args.string({ description: "Component subpath name" }),
  };
  static override flags = {
    path: Flags.string({
      description: "Destination directory",
      default: "src/components/snapshot",
    }),
    overwrite: Flags.boolean({ description: "Replace existing files" }),
    "dry-run": Flags.boolean({ description: "List files without writing" }),
    list: Flags.boolean({ description: "List available components" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);
    if (flags.list) {
      for (const name of await listComponents()) this.log(name);
      return;
    }
    if (!args.component) {
      this.error("A component name is required unless --list is used.");
    }

    const result = await addComponent({
      name: args.component,
      targetDir: flags.path,
      overwrite: flags.overwrite,
      dryRun: flags["dry-run"],
    });
    this.log(
      `${flags["dry-run"] ? "Would copy" : "Copied"} ${result.name} (${result.files.length} files) to ${result.targetDir}`,
    );
    if (result.dependencies.length > 0) {
      this.log(`External dependencies: ${result.dependencies.join(", ")}`);
    }
  }
}
