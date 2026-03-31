import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { TokenStorage } from "../auth/storage";

// ── Core config ──────────────────────────────────────────────────────────────

/** Core config — framework-level, always required. */
export interface SnapshotCoreConfig {
  apiUrl: string;
  /** `'cookie'` is the default and recommended mode for browser apps. */
  auth?: "cookie" | "token";
  /**
   * Static API credential. Not a user session token. Do not use in browser
   * deployments — emits a runtime warning in browser contexts.
   */
  bearerToken?: string;
  /**
   * When `auth: 'token'`, `'sessionStorage'` is the default (tab-scoped, survives
   * refresh). `'memory'` is stricter (loses state on reload). `'localStorage'` is
   * not recommended for auth tokens.
   */
  tokenStorage?: "localStorage" | "sessionStorage" | "memory";
  tokenKey?: string;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
}

// ── Cross-plugin callbacks ───────────────────────────────────────────────────

/**
 * Callback registry for cross-plugin communication.
 * Plugins push callbacks during setup; other plugins invoke them.
 * No event bus, no pub/sub — just typed callback arrays.
 */
export interface SnapshotCallbacks {
  /** Called after successful login (auth, MFA verify, OAuth exchange, passkey). */
  onLoginSuccess: Array<() => void>;
  /** Called after successful logout. */
  onLogoutSuccess: Array<() => void>;
}

// ── Plugin context ───────────────────────────────────────────────────────────

/**
 * Shared context passed to every plugin during setup and hook creation.
 * Core creates this; plugins read from it and write to the shared registry.
 */
export interface SnapshotPluginContext {
  /** The API client instance (shared across all plugins). */
  api: ApiClient;
  /** Token storage instance (shared). */
  tokenStorage: TokenStorage;
  /** The TanStack Query client (shared). */
  queryClient: QueryClient;
  /** The resolved core config. */
  config: SnapshotCoreConfig;
  /** Cross-plugin callback registry. */
  callbacks: SnapshotCallbacks;
  /**
   * Shared state registry. Plugins write opaque state here during setup;
   * other plugins read it during createHooks. Keyed by plugin name.
   *
   * Example: auth plugin stores pendingMfaChallengeAtom here so MFA
   * and WebAuthn hooks can read it.
   */
  shared: Map<string, unknown>;
}

// ── Plugin interface ─────────────────────────────────────────────────────────

/**
 * A snapshot plugin. Each domain (auth, ws, sse, community, etc.) implements this.
 *
 * Config is the factory's concern — captured via closure, not visible in this interface.
 * The plugin interface only cares about context and hooks.
 *
 * @template THooks The hooks object this plugin contributes to the instance.
 */
export interface SnapshotPlugin<THooks extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique plugin name. Used for dependency resolution and shared state keys. */
  readonly name: string;

  /** Plugin names that must be registered and set up before this one. */
  readonly dependencies?: readonly string[];

  /**
   * Phase 1: Setup infrastructure.
   * Create managers, atoms, register callbacks.
   * Runs after dependencies' setup has completed.
   * Can write to ctx.shared and ctx.callbacks.
   */
  setup?(ctx: SnapshotPluginContext): void;

  /**
   * Phase 2: Create hooks.
   * Runs after ALL plugins' setup phase has completed.
   * Returns the hooks object that will be merged into the snapshot instance.
   */
  createHooks(ctx: SnapshotPluginContext): THooks;

  /**
   * Cleanup. Called on instance disposal.
   */
  teardown?(): void;
}

// ── Core primitives ──────────────────────────────────────────────────────────

/** Primitives always present on every snapshot instance, regardless of plugins. */
export interface SnapshotCorePrimitives {
  api: ApiClient;
  tokenStorage: TokenStorage;
  queryClient: QueryClient;
  useTheme: () => {
    theme: "light" | "dark";
    toggle: () => void;
    set: (t: "light" | "dark") => void;
  };
  QueryProvider: React.FC<{ children: React.ReactNode }>;
  /** Tear down all plugins and release resources. */
  teardown: () => void;
}

// ── Type utilities ───────────────────────────────────────────────────────────

/** Extract the hooks type from a plugin. */
export type PluginHooks<P> = P extends SnapshotPlugin<infer THooks> ? THooks : never;

/**
 * Given a tuple of plugins, compute the intersection of all their hook types.
 *
 * [AuthPlugin, WsPlugin, CommunityPlugin] =>
 *   AuthPluginHooks & WsPluginHooks & CommunityPluginHooks
 */
export type MergePluginHooks<T extends readonly SnapshotPlugin[]> = T extends readonly [
  infer First,
  ...infer Rest extends readonly SnapshotPlugin[],
]
  ? PluginHooks<First> & MergePluginHooks<Rest>
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};

/** The final instance type: core primitives + all plugin hooks merged. */
export type SnapshotInstance<TPlugins extends readonly SnapshotPlugin[]> = SnapshotCorePrimitives &
  MergePluginHooks<TPlugins>;
