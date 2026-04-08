import fs from "node:fs/promises";
import path from "node:path";
import { log, spinner } from "@clack/prompts";
import type { AdminScaffoldConfig } from "./types";
import { exec } from "./utils";
import {
  generatePackageJson,
  generateTsConfig,
  generateViteConfig,
  generateEnvFile,
  generateSnapshotConfig,
  generateGitignore,
  generateCapabilitiesLib,
  generateSnapshotLib,
  generateRouterLib,
  generateAdminLayoutComponent,
  generateCapabilityContextComponent,
  generateUsersPageComponent,
  generateUserDetailPageComponent,
  generateUserSessionsPageComponent,
  generateUserAuditLogPageComponent,
  generateAuditLogPageComponent,
  generateGroupsPageComponent,
  generateOrgsPageComponent,
  generateCapabilitiesPageComponent,
  generateRootRoute,
  generateIndexRoute,
  generateAuthenticatedRoute,
  generateUsersRoute,
  generateUserDetailRoute,
  generateUserSessionsRoute,
  generateUserAuditLogRoute,
  generateAuditLogRoute,
  generateGroupsRoute,
  generateOrgsRoute,
  generateCapabilitiesRoute,
  generateWebhooksPageComponent,
  generateWebhookDetailPageComponent,
  generateWebhooksRoute,
  generateWebhookDetailRoute,
} from "./templates/admin";

export async function scaffoldAdmin(
  config: AdminScaffoldConfig,
): Promise<void> {
  const outDir = config.dir;

  async function write(relPath: string, content: string): Promise<void> {
    const abs = path.join(outDir, relPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, "utf8");
  }

  await fs.mkdir(outDir, { recursive: true });

  // Config files
  await write("package.json", generatePackageJson(config));
  await write("tsconfig.json", generateTsConfig());
  await write("vite.config.ts", generateViteConfig());
  await write(".env", generateEnvFile(config));
  await write(".gitignore", generateGitignore());
  await write("snapshot.config.json", generateSnapshotConfig(config));

  // Source: lib
  await write("src/lib/snapshot.ts", generateSnapshotLib(config));
  await write("src/lib/router.ts", generateRouterLib());
  await write("src/lib/capabilities.ts", generateCapabilitiesLib());

  // Source: components
  await write(
    "src/components/admin/AdminLayout.tsx",
    generateAdminLayoutComponent(),
  );
  await write(
    "src/components/admin/CapabilityGate.tsx",
    generateCapabilityContextComponent(),
  );

  // Source: pages
  await write("src/pages/admin/UsersPage.tsx", generateUsersPageComponent());
  await write(
    "src/pages/admin/UserDetailPage.tsx",
    generateUserDetailPageComponent(),
  );
  await write(
    "src/pages/admin/UserSessionsPage.tsx",
    generateUserSessionsPageComponent(),
  );
  await write(
    "src/pages/admin/UserAuditLogPage.tsx",
    generateUserAuditLogPageComponent(),
  );
  await write(
    "src/pages/admin/AuditLogPage.tsx",
    generateAuditLogPageComponent(),
  );
  await write("src/pages/admin/GroupsPage.tsx", generateGroupsPageComponent());
  await write("src/pages/admin/OrgsPage.tsx", generateOrgsPageComponent());
  await write(
    "src/pages/admin/CapabilitiesPage.tsx",
    generateCapabilitiesPageComponent(),
  );

  // Source: routes
  await write("src/routes/__root.tsx", generateRootRoute());
  await write("src/routes/index.tsx", generateIndexRoute());
  await write("src/routes/_authenticated.tsx", generateAuthenticatedRoute());
  await write("src/routes/_authenticated/users.tsx", generateUsersRoute());
  await write(
    "src/routes/_authenticated/users.$userId.tsx",
    generateUserDetailRoute(),
  );
  await write(
    "src/routes/_authenticated/users.$userId.sessions.tsx",
    generateUserSessionsRoute(),
  );
  await write(
    "src/routes/_authenticated/users.$userId.audit-log.tsx",
    generateUserAuditLogRoute(),
  );
  await write(
    "src/routes/_authenticated/audit-log.tsx",
    generateAuditLogRoute(),
  );
  await write("src/routes/_authenticated/groups.tsx", generateGroupsRoute());
  await write("src/routes/_authenticated/orgs.tsx", generateOrgsRoute());
  await write(
    "src/routes/_authenticated/capabilities.tsx",
    generateCapabilitiesRoute(),
  );

  // Webhook admin pages (optional)
  if (config.webhookAdminPages) {
    await write(
      "src/pages/admin/WebhooksPage.tsx",
      generateWebhooksPageComponent(),
    );
    await write(
      "src/pages/admin/WebhookDetailPage.tsx",
      generateWebhookDetailPageComponent(),
    );
    await write(
      "src/routes/_authenticated/webhooks.tsx",
      generateWebhooksRoute(),
    );
    await write(
      "src/routes/_authenticated/webhooks.$endpointId.tsx",
      generateWebhookDetailRoute(),
    );
  }

  // Placeholder directories
  await write("src/hooks/api/.gitkeep", "");
  await write("src/api/.gitkeep", "");
  await write("src/types/.gitkeep", "");

  // Step: bun install
  const s = spinner();
  s.start("Installing dependencies");
  exec("bun install", outDir);
  s.stop("Dependencies installed");

  // Step: git init
  if (config.gitInit) {
    s.start("Initialising git repository");
    try {
      exec(
        'git init && git add -A && git commit -m "init: scaffold admin app from @lastshotlabs/snapshot"',
        outDir,
        true,
      );
      s.stop("Git repository initialised");
    } catch (err) {
      s.stop("Git init failed");
      const stderr = (err as NodeJS.ErrnoException & { stderr?: Buffer })
        ?.stderr;
      log.warn(`Git init failed: ${stderr?.toString() ?? String(err)}`);
    }
  }
}
