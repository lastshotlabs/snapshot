import { intro } from "@clack/prompts";
import { Command, Flags } from "@oclif/core";
import process from "node:process";
import { runSync } from "../sync.js";

export default class Sync extends Command {
  static override description = "Sync OpenAPI schema to TypeScript types and React Query hooks";
  static override examples = [
    "<%= config.bin %> sync --api http://localhost:3000",
    "<%= config.bin %> sync --file ./schema.json --zod",
    "<%= config.bin %> sync --api http://localhost:3000 --watch",
  ];
  static override flags = {
    api: Flags.string({ description: "API URL to fetch OpenAPI schema from" }),
    file: Flags.string({ description: "Local schema file path" }),
    watch: Flags.boolean({
      char: "w",
      description: "Watch for schema changes",
    }),
    zod: Flags.boolean({ description: "Generate Zod validators" }),
    "api-dir": Flags.string({ description: "API implementation directory" }),
    "hooks-dir": Flags.string({ description: "Generated hooks directory" }),
    "types-path": Flags.string({ description: "Custom types path" }),
    "snapshot-import": Flags.string({
      description: "Custom snapshot import name",
    }),
    include: Flags.string({
      description: "Glob patterns for paths to include (comma-separated)",
      multiple: true,
    }),
    exclude: Flags.string({
      description: "Glob patterns for paths to exclude (comma-separated)",
      multiple: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Sync);
    intro("@lastshotlabs/snapshot sync");
    await runSync({
      apiUrl: flags.api,
      filePath: flags.file,
      cwd: process.cwd(),
      watch: flags.watch ?? false,
      zod: flags.zod ?? false,
      apiDir: flags["api-dir"],
      hooksDir: flags["hooks-dir"],
      typesPath: flags["types-path"],
      snapshotImport: flags["snapshot-import"],
      include: flags.include,
      exclude: flags.exclude,
    });
  }
}
