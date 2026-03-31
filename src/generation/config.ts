import type { ManifestHandlerRegistry } from "../manifest/registry";
import { createDefaultManifestRegistry } from "../manifest/registry";
import type { FrontendManifest } from "../manifest/schema";
import { type AuthPluginConfig, createAuthPlugin } from "../plugins/auth-plugin";
import { createCommunityPlugin } from "../plugins/community-plugin";
import { createPushPlugin } from "../plugins/push-plugin";
import { createSsePlugin } from "../plugins/sse-plugin";
import type { SnapshotCoreConfig } from "../plugins/types";
import type { SnapshotPlugin } from "../plugins/types";
import { createWebhookPlugin } from "../plugins/webhook-plugin";
import { createWsPlugin } from "../plugins/ws-plugin";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SnapshotConfigFromManifest {
  coreConfig: SnapshotCoreConfig;
  plugins: SnapshotPlugin[];
}

export interface GenerateConfigOptions {
  /** Handler registry for resolving custom handlers. Defaults to built-in registry. */
  registry?: ManifestHandlerRegistry;
  /** Environment name to apply overrides from manifest.environments. */
  environment?: string;
}

// ── Config generation ────────────────────────────────────────────────────────

/**
 * Generates the runtime createSnapshot config from a validated manifest.
 *
 * This is the frontend equivalent of bunshot's `generateConfig()`.
 * Takes a manifest (declarative JSON) and produces:
 * - `coreConfig`: the first argument to `createSnapshot()`
 * - `plugins`: the rest arguments to `createSnapshot()`
 *
 * @example
 * ```ts
 * const manifest = JSON.parse(fs.readFileSync('app.manifest.json', 'utf8'))
 * const { coreConfig, plugins } = generateSnapshotConfig(manifest)
 * const app = createSnapshot(coreConfig, ...plugins)
 * ```
 */
export function generateSnapshotConfig(
  manifest: FrontendManifest,
  options: GenerateConfigOptions = {},
): SnapshotConfigFromManifest {
  const env = options.environment;
  const envOverride = env && manifest.environments?.[env];

  // ── Core config ──────────────────────────────────────────────────────────

  const apiSection = envOverride?.api ? { ...manifest.api, ...envOverride.api } : manifest.api;

  const coreConfig: SnapshotCoreConfig = {
    apiUrl: apiSection.baseUrl,
    auth: apiSection.auth,
    bearerToken: apiSection.bearerToken,
    tokenStorage: apiSection.tokenStorage,
    staleTime: apiSection.staleTime,
    gcTime: apiSection.gcTime,
    retry: apiSection.retry,
  };

  // ── Plugins ──────────────────────────────────────────────────────────────

  const plugins: SnapshotPlugin[] = [];

  // Auth plugin — always added if auth section exists
  if (manifest.auth) {
    const authConfig: AuthPluginConfig = {
      loginPath: manifest.auth.loginPath,
      homePath: manifest.auth.homePath ?? manifest.auth.redirect,
      forbiddenPath: manifest.auth.forbiddenPath,
      mfaPath: manifest.auth.mfaPath,
      mfaSetupPath: manifest.auth.mfaSetupPath,
      contract: manifest.auth.contract as AuthPluginConfig["contract"],
    };
    plugins.push(createAuthPlugin(authConfig));
  }

  // WS plugin — added if ws section exists
  const wsSection = envOverride?.ws ? { ...manifest.ws, ...envOverride.ws } : manifest.ws;

  if (wsSection?.url) {
    plugins.push(
      createWsPlugin({
        url: wsSection.url,
        autoReconnect: wsSection.autoReconnect,
        reconnectOnLogin: wsSection.reconnectOnLogin,
        reconnectOnFocus: wsSection.reconnectOnFocus,
        maxReconnectAttempts: wsSection.maxReconnectAttempts,
        reconnectBaseDelay: wsSection.reconnectBaseDelay,
        reconnectMaxDelay: wsSection.reconnectMaxDelay,
      }),
    );
  }

  // SSE plugin — added if sse section exists
  const sseSection = envOverride?.sse ? { ...manifest.sse, ...envOverride.sse } : manifest.sse;

  if (sseSection?.endpoints && Object.keys(sseSection.endpoints).length > 0) {
    plugins.push(
      createSsePlugin({
        endpoints: sseSection.endpoints,
        reconnectOnLogin: sseSection.reconnectOnLogin,
      }),
    );
  }

  // Feature plugins — resolved from manifest.features
  if (manifest.features) {
    for (const feature of manifest.features) {
      switch (feature.feature) {
        case "community":
          plugins.push(
            createCommunityPlugin(feature.config as Parameters<typeof createCommunityPlugin>[0]),
          );
          break;
        case "webhooks":
          plugins.push(createWebhookPlugin());
          break;
        case "push":
          plugins.push(createPushPlugin(feature.config as Parameters<typeof createPushPlugin>[0]));
          break;
        default:
          // Unknown features are resolved from the handler registry if provided
          if (options.registry?.has("component", feature.feature)) {
            // Custom feature plugin — resolved at runtime
            console.warn(
              `[snapshot] Feature "${feature.feature}" is not a built-in feature. ` +
                "Custom feature plugins must be passed directly to createSnapshot().",
            );
          }
          break;
      }
    }
  }

  return { coreConfig, plugins };
}
