import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ApiClient } from "./api/client";
import { createTokenStorage } from "./auth/storage";
import { warnOnce } from "./auth/warnings";
import { sortPlugins } from "./plugins/registry";
import type {
  SnapshotCallbacks,
  SnapshotCoreConfig,
  SnapshotCorePrimitives,
  SnapshotInstance,
  SnapshotPlugin,
  SnapshotPluginContext,
} from "./plugins/types";
import { QueryProviderInner } from "./providers/QueryProvider";
import { useTheme } from "./theme/hook";

/**
 * Creates a snapshot instance with the given core config and plugins.
 *
 * Each plugin contributes hooks to the returned instance. The return type
 * is the intersection of all plugin hook types plus core primitives.
 *
 * @example
 * ```ts
 * const app = createSnapshot(
 *   { apiUrl: 'http://localhost:3000' },
 *   createAuthPlugin({ loginPath: '/login' }),
 *   createWsPlugin({ url: 'ws://localhost:3000/ws' }),
 *   createCommunityPlugin(),
 * )
 *
 * app.useLogin    // from auth plugin
 * app.useSocket   // from ws plugin
 * app.useContainers // from community plugin
 * ```
 */
export function createSnapshot<const TPlugins extends SnapshotPlugin[]>(
  config: SnapshotCoreConfig,
  ...plugins: TPlugins
): SnapshotInstance<TPlugins> {
  // ── Core infrastructure ────────────────────────────────────────────────────

  const api = new ApiClient({
    apiUrl: config.apiUrl,
    auth: config.auth,
    bearerToken: config.bearerToken,
  });

  const tokenStorage = createTokenStorage({
    auth: config.auth,
    tokenStorage: config.tokenStorage,
    tokenKey: config.tokenKey,
  });
  api.setStorage(tokenStorage);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: config.staleTime ?? 5 * 60 * 1000,
        gcTime: config.gcTime ?? 10 * 60 * 1000,
        retry: config.retry ?? 1,
      },
    },
  });

  // ── Security warnings ──────────────────────────────────────────────────────

  if (config.bearerToken && typeof window !== "undefined") {
    warnOnce(
      "bearer-token:browser",
      "[snapshot] bearerToken is a static API credential. " +
        "It should not be used in browser deployments.",
    );
  }

  // ── Cross-plugin callback registry ─────────────────────────────────────────

  const callbacks: SnapshotCallbacks = {
    onLoginSuccess: [],
    onLogoutSuccess: [],
  };

  // ── Plugin context ─────────────────────────────────────────────────────────

  const ctx: SnapshotPluginContext = {
    api,
    tokenStorage,
    queryClient,
    config,
    callbacks,
    shared: new Map(),
  };

  // ── Sort plugins by dependency order ───────────────────────────────────────

  const sorted = sortPlugins(plugins);

  // ── Phase 1: Setup ─────────────────────────────────────────────────────────
  // Plugins create managers, atoms, register callbacks.
  // Runs in dependency order.

  for (const plugin of sorted) {
    plugin.setup?.(ctx);
  }

  // ── Phase 2: Create hooks ──────────────────────────────────────────────────
  // Runs after ALL setup is complete so plugins can read each other's shared state.

  let mergedHooks: Record<string, unknown> = {};
  for (const plugin of sorted) {
    const pluginHooks = plugin.createHooks(ctx);
    mergedHooks = { ...mergedHooks, ...pluginHooks };
  }

  // ── Core primitives ────────────────────────────────────────────────────────

  function QueryProvider({ children }: { children: ReactNode }) {
    return <QueryProviderInner client={queryClient}>{children}</QueryProviderInner>;
  }

  function teardown() {
    for (const plugin of sorted.toReversed()) {
      plugin.teardown?.();
    }
  }

  const corePrimitives: SnapshotCorePrimitives = {
    api,
    tokenStorage,
    queryClient,
    useTheme,
    QueryProvider,
    teardown,
  };

  return { ...corePrimitives, ...mergedHooks } as SnapshotInstance<TPlugins>;
}
