import fs from "node:fs/promises";
import path from "node:path";
import { log, spinner } from "@clack/prompts";
import type { ScaffoldConfig } from "./types";
import { exec } from "./utils";
import { generatePackageJson } from "./templates/package-json";
import {
  generateTsConfigRoot,
  generateTsConfigApp,
  generateTsConfigNode,
} from "./templates/tsconfig";
import { generateViteConfig } from "./templates/vite-config";
import { generateComponentsJson } from "./templates/components-json";
import { generateEnv } from "./templates/env";
import { generateIndexHtml } from "./templates/index-html";
import { generateGlobalsCss } from "./templates/globals-css";
import { generateSnapshotLib } from "./templates/snapshot-lib";
import { generateRouterLib } from "./templates/router-lib";
import { generateMain } from "./templates/main";
import { generateTypesApi } from "./templates/types-api";
import { generateStoreUi } from "./templates/store-ui";
import { UTILS_CONTENT } from "./templates/utils-ts";
import { generateSnapshotConfig } from "./templates/snapshot-config";
import { generateRootRoute } from "./templates/routes/root";
import { generateIndexRoute } from "./templates/routes/index";
import { generateAuthenticatedRoute } from "./templates/routes/authenticated";
import { generateGuestRoute } from "./templates/routes/guest";
import { generateLoginPage } from "./templates/routes/auth-login";
import { generateRegisterPage } from "./templates/routes/auth-register";
import { generateForgotPasswordPage } from "./templates/routes/auth-forgot";
import { generateMfaVerifyPage } from "./templates/routes/auth-mfa-verify";
import { generateMfaSetupPage } from "./templates/routes/mfa-setup";
import { generateResetPasswordPage } from "./templates/routes/auth-reset-password";
import { generateVerifyEmailPage } from "./templates/routes/auth-verify-email";
import { generateOAuthCallbackPage } from "./templates/routes/auth-oauth-callback";
import { generateLoginPageComponent } from "./templates/pages/auth-login";
import { generatePasskeyManagePageComponent } from "./templates/pages/auth-passkey-manage";
import { generatePasskeyManagePage } from "./templates/routes/passkey-manage";
import { generateRegisterPageComponent } from "./templates/pages/auth-register";
import { generateForgotPasswordPageComponent } from "./templates/pages/auth-forgot";
import { generateMfaVerifyPageComponent } from "./templates/pages/auth-mfa-verify";
import { generateMfaSetupPageComponent } from "./templates/pages/auth-mfa-setup";
import { generateResetPasswordPageComponent } from "./templates/pages/auth-reset-password";
import { generateVerifyEmailPageComponent } from "./templates/pages/auth-verify-email";
import { generateOAuthCallbackPageComponent } from "./templates/pages/auth-oauth-callback";
import { generateHomePageComponent } from "./templates/pages/home";
import { generateSettingsPageComponent } from "./templates/pages/settings";
import { generateSettingsPasswordPageComponent } from "./templates/pages/settings-password";
import { generateSettingsSessionsPageComponent } from "./templates/pages/settings-sessions";
import { generateSettingsDeleteAccountPageComponent } from "./templates/pages/settings-delete-account";
import { generateSettingsEmailOtpPageComponent } from "./templates/pages/settings-email-otp";
import {
  generateSettingsIndexRoute,
  generateSettingsPasswordRoute,
  generateSettingsSessionsRoute,
  generateSettingsDeleteAccountRoute,
  generateSettingsEmailOtpRoute,
} from "./templates/routes/settings";
import {
  generateAuthLayout,
  generatePendingComponent,
  generateErrorComponent,
  generateNotFoundComponent,
  generatePageTransition,
} from "./templates/layouts/shared";
import { generateRootLayoutMinimal } from "./templates/layouts/minimal";
import {
  generateRootLayoutTopNav,
  generateTopNav,
} from "./templates/layouts/top-nav";
import {
  generateRootLayoutSidebar,
  generateSidebar,
  generateSidebarHeader,
  generateSidebarNav,
  generateTopBar,
} from "./templates/layouts/sidebar";
import { generateMailPlugin } from "./templates/mail";
import {
  generateCommunityContainersPageComponent,
  generateCommunityThreadListPageComponent,
  generateCommunityThreadPageComponent,
} from "./templates/pages/community-containers";
import {
  generateCommunityContainersRoute,
  generateCommunityThreadListRoute,
  generateCommunityThreadRoute,
} from "./templates/routes/community";

const GITIGNORE_CONTENT = `node_modules/
dist/
.env
.env.local
*.local
routeTree.gen.ts
`;

export async function scaffold(config: ScaffoldConfig): Promise<void> {
  async function write(relPath: string, content: string): Promise<void> {
    const abs = path.join(config.dir, relPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, "utf8");
  }

  await fs.mkdir(config.dir, { recursive: true });

  // Config files
  await write("package.json", generatePackageJson(config));
  await write("tsconfig.json", generateTsConfigRoot());
  await write("tsconfig.app.json", generateTsConfigApp());
  await write("tsconfig.node.json", generateTsConfigNode());
  await write("vite.config.ts", generateViteConfig());
  await write("components.json", generateComponentsJson(config));
  await write("snapshot.config.json", generateSnapshotConfig());
  await write(".env", generateEnv(config));
  await write(".gitignore", GITIGNORE_CONTENT);
  await write("index.html", generateIndexHtml(config));
  await write(
    "public/vite.svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#646cff"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="18" fill="white">S</text></svg>',
  );

  // Source files
  await write("src/lib/snapshot.ts", generateSnapshotLib(config));
  await write("src/lib/router.ts", generateRouterLib());

  const mainContent = generateMain(config);
  if (config.securityProfile === "prototype") {
    const guard = `// Prototype mode deployment guard
if (
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !import.meta.env.VITE_ALLOW_PROTOTYPE_DEPLOYMENT
) {
  throw new Error(
    '[snapshot] This app was scaffolded in prototype mode and is running on a non-localhost origin. ' +
    'Set VITE_ALLOW_PROTOTYPE_DEPLOYMENT=true to override (not recommended for production).'
  )
}

`;
    await write("src/main.tsx", guard + mainContent);
  } else {
    await write("src/main.tsx", mainContent);
  }
  await write("src/routes/__root.tsx", generateRootRoute(config));
  await write("src/routes/_authenticated/index.tsx", generateIndexRoute());
  await write("src/pages/HomePage.tsx", generateHomePageComponent());
  await write("src/routes/_authenticated.tsx", generateAuthenticatedRoute());
  await write("src/routes/_guest.tsx", generateGuestRoute());

  if (config.authPages) {
    await write("src/routes/_guest/auth/login.tsx", generateLoginPage(config));
    await write(
      "src/routes/_guest/auth/register.tsx",
      generateRegisterPage(config),
    );
    await write(
      "src/routes/_guest/auth/forgot-password.tsx",
      generateForgotPasswordPage(),
    );
    await write(
      "src/routes/_guest/auth/reset-password.tsx",
      generateResetPasswordPage(),
    );
    await write(
      "src/routes/_guest/auth/verify-email.tsx",
      generateVerifyEmailPage(),
    );
    await write(
      "src/routes/_guest/auth/oauth/callback.tsx",
      generateOAuthCallbackPage(config),
    );
    await write(
      "src/pages/auth/LoginPage.tsx",
      generateLoginPageComponent(config),
    );
    await write(
      "src/pages/auth/RegisterPage.tsx",
      generateRegisterPageComponent(config),
    );
    await write(
      "src/pages/auth/ForgotPasswordPage.tsx",
      generateForgotPasswordPageComponent(),
    );
    await write(
      "src/pages/auth/ResetPasswordPage.tsx",
      generateResetPasswordPageComponent(),
    );
    await write(
      "src/pages/auth/VerifyEmailPage.tsx",
      generateVerifyEmailPageComponent(),
    );
    await write(
      "src/pages/auth/OAuthCallbackPage.tsx",
      generateOAuthCallbackPageComponent(config),
    );

    if (config.mfaPages) {
      await write(
        "src/routes/_guest/auth/mfa-verify.tsx",
        generateMfaVerifyPage(config),
      );
      await write(
        "src/routes/_authenticated/mfa-setup.tsx",
        generateMfaSetupPage(config),
      );
      await write(
        "src/pages/auth/MfaVerifyPage.tsx",
        generateMfaVerifyPageComponent(config),
      );
      await write(
        "src/pages/auth/MfaSetupPage.tsx",
        generateMfaSetupPageComponent(config),
      );
      await write(
        "src/routes/_authenticated/settings/email-otp.tsx",
        generateSettingsEmailOtpRoute(),
      );
      await write(
        "src/pages/settings/SettingsEmailOtpPage.tsx",
        generateSettingsEmailOtpPageComponent(),
      );
    }

    if (config.passkeyPages) {
      await write(
        "src/routes/_authenticated/passkey.tsx",
        generatePasskeyManagePage(),
      );
      await write(
        "src/pages/auth/PasskeyManagePage.tsx",
        generatePasskeyManagePageComponent(),
      );
    }

    // Settings pages (core auth features — always with authPages)
    await write(
      "src/routes/_authenticated/settings/index.tsx",
      generateSettingsIndexRoute(),
    );
    await write(
      "src/routes/_authenticated/settings/password.tsx",
      generateSettingsPasswordRoute(),
    );
    await write(
      "src/routes/_authenticated/settings/sessions.tsx",
      generateSettingsSessionsRoute(),
    );
    await write(
      "src/routes/_authenticated/settings/delete-account.tsx",
      generateSettingsDeleteAccountRoute(),
    );
    await write(
      "src/pages/settings/SettingsPage.tsx",
      generateSettingsPageComponent(),
    );
    await write(
      "src/pages/settings/SettingsPasswordPage.tsx",
      generateSettingsPasswordPageComponent(),
    );
    await write(
      "src/pages/settings/SettingsSessionsPage.tsx",
      generateSettingsSessionsPageComponent(),
    );
    await write(
      "src/pages/settings/SettingsDeleteAccountPage.tsx",
      generateSettingsDeleteAccountPageComponent(),
    );
  }

  // Layout-specific components
  if (config.layout === "minimal") {
    await write(
      "src/components/layout/RootLayout.tsx",
      generateRootLayoutMinimal(),
    );
  } else if (config.layout === "top-nav") {
    await write(
      "src/components/layout/RootLayout.tsx",
      generateRootLayoutTopNav(),
    );
    await write("src/components/layout/TopNav.tsx", generateTopNav(config));
  } else {
    await write(
      "src/components/layout/RootLayout.tsx",
      generateRootLayoutSidebar(),
    );
    await write("src/components/layout/Sidebar.tsx", generateSidebar());
    await write(
      "src/components/layout/SidebarHeader.tsx",
      generateSidebarHeader(config),
    );
    await write("src/components/layout/SidebarNav.tsx", generateSidebarNav());
    await write("src/components/layout/TopBar.tsx", generateTopBar());
  }

  // Shared layout components
  await write("src/components/layout/AuthLayout.tsx", generateAuthLayout());
  await write(
    "src/components/layout/PendingComponent.tsx",
    generatePendingComponent(),
  );
  await write(
    "src/components/layout/ErrorComponent.tsx",
    generateErrorComponent(),
  );
  await write(
    "src/components/layout/NotFoundComponent.tsx",
    generateNotFoundComponent(),
  );
  await write(
    "src/components/layout/PageTransition.tsx",
    generatePageTransition(),
  );

  // Store, types, utils
  await write("src/store/ui.ts", generateStoreUi(config));
  await write("src/types/api.ts", generateTypesApi());
  await write("src/lib/utils.ts", UTILS_CONTENT);

  // Placeholder directories
  await write("src/components/shared/.gitkeep", "");
  await write("src/hooks/.gitkeep", "");
  await write("src/hooks/api/.gitkeep", "");
  await write("src/api/.gitkeep", "");

  // Community pages
  if (config.communityPages) {
    await write(
      "src/pages/community/CommunityContainersPage.tsx",
      generateCommunityContainersPageComponent(),
    );
    await write(
      "src/pages/community/CommunityThreadListPage.tsx",
      generateCommunityThreadListPageComponent(),
    );
    await write(
      "src/pages/community/CommunityThreadPage.tsx",
      generateCommunityThreadPageComponent(),
    );
    await write(
      "src/routes/_authenticated/community/index.tsx",
      generateCommunityContainersRoute(),
    );
    await write(
      "src/routes/_authenticated/community/$containerId.tsx",
      generateCommunityThreadListRoute(),
    );
    await write(
      "src/routes/_authenticated/community/$containerId.$threadId.tsx",
      generateCommunityThreadRoute(),
    );
  }

  // bunshot-mail plugin config (for the backend)
  if (config.mailPlugin) {
    await write("server-plugins/mail.ts", generateMailPlugin());
  }

  // Step: bun install
  const s = spinner();
  s.start("Installing dependencies");
  exec("bun install", config.dir);
  s.stop("Dependencies installed");

  // Step: shadcn init + add
  if (config.components.length > 0) {
    s.start("Running shadcn init");
    try {
      exec("bunx shadcn@latest init --yes", config.dir, true);
      s.stop("shadcn initialized");
    } catch {
      s.stop("shadcn init failed — continuing");
      log.warn(
        "shadcn init failed. You can run it manually: bunx shadcn@latest init",
      );
    }

    s.start("Adding shadcn components");
    try {
      exec(
        `bunx shadcn@latest add ${config.components.join(" ")} --yes`,
        config.dir,
      );
      s.stop("shadcn components added");

      // Fix deprecated React.ElementRef → React.ComponentRef in generated components
      const uiDir = path.join(config.dir, "src/components/ui");
      const uiFiles = await fs.readdir(uiDir).catch(() => []);
      await Promise.all(
        uiFiles
          .filter((f) => f.endsWith(".tsx"))
          .map(async (f) => {
            const filePath = path.join(uiDir, f);
            const content = await fs.readFile(filePath, "utf8");
            if (content.includes("ElementRef")) {
              await fs.writeFile(
                filePath,
                content.replaceAll("ElementRef", "ComponentRef"),
                "utf8",
              );
            }
          }),
      );
    } catch {
      s.stop("Some components may not have been added");
      log.warn(
        "shadcn add encountered an error. Run `bunx shadcn@latest add <component>` manually for any missing ones.",
      );
    }
  }

  // Step: overwrite globals.css with our theme (after shadcn may have generated its own)
  await write("src/styles/globals.css", generateGlobalsCss(config));

  // Step: git init
  if (config.gitInit) {
    s.start("Initialising git repository");
    try {
      exec(
        'git init && git add -A && git commit -m "chore: initial scaffold from @lastshotlabs/snapshot"',
        config.dir,
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
