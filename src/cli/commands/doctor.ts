import { Command, Flags } from "@oclif/core";
import process from "node:process";
import { runDoctor } from "../doctor.js";

export default class Doctor extends Command {
  static override description =
    "Diagnose Snapshot links, registry authentication, peers, and lockfile configuration";
  static override examples = [
    "<%= config.bin %> doctor",
    "<%= config.bin %> doctor --json",
    "<%= config.bin %> doctor --cwd ./apps/web",
  ];
  static override flags = {
    cwd: Flags.directory({
      description: "Consumer project directory",
      default: ".",
    }),
    json: Flags.boolean({ description: "Print machine-readable JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Doctor);
    const checks = runDoctor({ cwd: flags.cwd });

    if (flags.json) {
      this.log(JSON.stringify({ checks }, null, 2));
    } else {
      for (const check of checks) {
        const marker =
          check.status === "pass"
            ? "PASS"
            : check.status === "warn"
              ? "WARN"
              : "FAIL";
        this.log(`${marker} ${check.id}: ${check.message}`);
        for (const detail of check.details ?? []) this.log(`  - ${detail}`);
      }
    }

    if (checks.some((check) => check.status === "fail")) {
      process.exitCode = 1;
    }
  }
}
