import { existsSync } from "node:fs";
import { markdownPage, repoPath, writeDoc } from "./_common";

type Capability = {
  name: string;
  status: "present" | "missing";
  evidence: string[];
};

function detectCapability(name: string, files: string[]): Capability {
  const present = files.filter((file) => existsSync(repoPath(file)));
  return {
    name,
    status: present.length > 0 ? "present" : "missing",
    evidence: present,
  };
}

export function generateCapabilityMap(): void {
  const capabilities = [
    detectCapability("SDK bootstrap and typed runtime", [
      "src/index.ts",
      "src/create-snapshot.tsx",
      "src/api/client.ts",
    ]),
    detectCapability("Plugin system and schema generation", [
      "src/plugin.ts",
      "src/schema-generator.ts",
    ]),
    detectCapability("Auth screens, MFA, passkeys, and OAuth", [
      "src/auth/oauth-hooks.ts",
      "src/auth/mfa-hooks.ts",
      "src/ui/presets/auth-page.ts",
      "src/ui/components/primitives/passkey-button/index.ts",
      "src/ui/components/primitives/oauth-buttons/index.ts",
    ]),
    detectCapability("Manifest-driven UI", [
      "src/ui.ts",
      "src/ui/manifest/schema.ts",
      "src/ui/manifest/app.tsx",
    ]),
    detectCapability("Manifest routing, layouts, navigation, and guards", [
      "src/ui/manifest/router.ts",
      "src/ui/layouts/registry.tsx",
      "src/ui/manifest/guard-registry.ts",
      "src/ui/components/layout/nav/index.ts",
      "src/ui/components/layout/nav-user-menu/index.ts",
    ]),
    detectCapability("Actions, overlays, state, and workflows", [
      "src/ui/actions/executor.ts",
      "src/ui/actions/confirm.tsx",
      "src/ui/actions/toast.tsx",
      "src/ui/state/hooks.ts",
      "src/ui/workflows/engine.ts",
    ]),
    detectCapability("Tokenized theming, slots, and stateful styling", [
      "src/ui/tokens/resolve.ts",
      "src/ui/tokens/schema.ts",
      "src/ui/components/_base/schema.ts",
      "src/ui/components/_base/style-surfaces.ts",
    ]),
    detectCapability("Analytics, shortcuts, expressions, and i18n", [
      "src/ui/analytics/registry.ts",
      "src/ui/shortcuts/listener.ts",
      "src/ui/expressions/parser.ts",
      "src/ui/i18n/schema.ts",
    ]),
    detectCapability("Entity-page mapping and preset-driven assembly", [
      "src/ui/entity-pages/index.ts",
      "src/ui/presets/index.ts",
      "src/ui/presets/crud-page.ts",
      "src/ui/presets/settings-page.ts",
    ]),
    detectCapability("SSR and manifest rendering", [
      "src/ssr/index.ts",
      "src/ssr/manifest-renderer.ts",
      "src/ssr/render.ts",
    ]),
    detectCapability("React Server Components support", [
      "src/ssr/rsc.ts",
      "src/vite/rsc-transform.ts",
    ]),
    detectCapability("Prefetch, PPR, and SSG-oriented Vite integration", [
      "src/ssr/prefetch.ts",
      "src/ssr/ppr.ts",
      "src/ssr/ppr-cache.ts",
      "src/vite/index.ts",
    ]),
    detectCapability("CLI scaffold, sync, and manifest commands", [
      "src/cli/commands/init.ts",
      "src/cli/commands/sync.ts",
      "src/cli/commands/manifest/init.ts",
      "src/cli/commands/manifest/validate.ts",
    ]),
    detectCapability("Community, notifications, and webhook APIs", [
      "src/community/index.ts",
      "src/webhooks/index.ts",
    ]),
    detectCapability("Realtime: websocket, SSE, and push", [
      "src/ws/manager.ts",
      "src/sse/manager.ts",
      "src/push/hook.ts",
    ]),
    detectCapability("Data, forms, navigation, and overlay components", [
      "src/ui/components/data/data-table/index.ts",
      "src/ui/components/forms/auto-form/index.ts",
      "src/ui/components/navigation/tree-view/index.ts",
      "src/ui/components/overlay/command-palette/index.ts",
    ]),
    detectCapability("Content and media components", [
      "src/ui/components/content/markdown/index.ts",
      "src/ui/components/content/rich-input/index.ts",
      "src/ui/components/content/rich-text-editor/index.ts",
      "src/ui/components/content/file-uploader/index.ts",
      "src/ui/components/media/image/index.ts",
      "src/ui/components/media/embed/index.ts",
      "src/ui/components/content/link-embed/index.ts",
    ]),
    detectCapability("Communication and community UI", [
      "src/ui/components/communication/chat-window/index.ts",
      "src/ui/components/communication/comment-section/index.ts",
      "src/ui/components/communication/message-thread/index.ts",
      "src/ui/components/communication/emoji-picker/index.ts",
      "src/ui/components/communication/gif-picker/index.ts",
      "src/ui/components/communication/presence-indicator/index.ts",
    ]),
    detectCapability("Workflow, commerce, and operational surfaces", [
      "src/ui/components/workflow/kanban/index.ts",
      "src/ui/components/workflow/calendar/index.ts",
      "src/ui/components/workflow/notification-feed/index.ts",
      "src/ui/components/commerce/pricing-table/index.ts",
      "src/ui/components/data/chart/index.ts",
      "src/ui/components/data/feed/index.ts",
      "src/ui/components/forms/wizard/index.ts",
    ]),
    detectCapability("Visual component showcase and canonical examples", [
      "playground/src/showcase.tsx",
      "playground/src/app.tsx",
      "playground/src/token-editor.tsx",
    ]),
    detectCapability("Testing infrastructure and contract suites", [
      "src/test-setup.ts",
      "src/create-snapshot.test.tsx",
      "src/ui/manifest/__tests__/schema.test.ts",
      "src/ssr/__tests__/render.test.tsx",
      "src/vite/__tests__/plugin.test.ts",
      "src/cli/__tests__/manifest-validate.test.ts",
    ]),
  ];

  const rows = capabilities.map((capability) => {
    const evidence =
      capability.evidence.length > 0
        ? capability.evidence.map((value) => `\`${value}\``).join(", ")
        : "None";
    return `| ${capability.name} | ${capability.status} | ${evidence} |`;
  });

  writeDoc(
    "start-here/capabilities.md",
    markdownPage(
      "Capabilities",
      "Generated overview of major Snapshot capabilities backed by current source.",
      [
        "This page is generated from current source presence checks. It exists to keep the top-level docs honest about what Snapshot can do on `main`.",
        "",
        "| Capability | Status | Evidence |",
        "|---|---|---|",
        ...rows,
      ].join("\n"),
    ),
  );
}

if (import.meta.main) {
  generateCapabilityMap();
}
