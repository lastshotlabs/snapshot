import { Command, Args, Flags } from "@oclif/core";
import process from "node:process";
import path from "node:path";
import { intro, outro, cancel, log } from "@clack/prompts";
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
