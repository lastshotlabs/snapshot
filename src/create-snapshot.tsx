import { QueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { ApiClient } from "./api/client";
import { createTokenStorage } from "./auth/storage";
import { createAuthHooks } from "./auth/hooks";
import { createMfaHooks } from "./auth/mfa-hooks";
import { createAccountHooks } from "./auth/account-hooks";
import { createOAuthHooks } from "./auth/oauth-hooks";
import { mergeContract } from "./auth/contract";
import { createWebAuthnHooks } from "./auth/webauthn-hooks";
import { isMfaChallenge } from "./types";
import type { MfaChallenge } from "./types";
import { WebSocketManager } from "./ws/manager";
import { wsManagerAtom } from "./ws/atom";
import { createWsHooks } from "./ws/hook";
import { createCommunityHooks } from "./community/hooks";
import { createWebhookHooks } from "./webhooks/hooks";
import { SseManager } from "./sse/manager";
import type { SseConnectionStatus } from "./sse/manager";
import { useTheme } from "./theme/hook";
import { createLoaders } from "./routing/loaders";
import { QueryProviderInner } from "./providers/QueryProvider";
import { createAuthErrorFormatter } from "./auth/error-format";
import { getAuthScreenPath } from "./ui/manifest/auth-routes";
import type {
  SnapshotConfig,
  SnapshotInstance,
  CommunityNotification,
  UseCommunityNotificationsOpts,
  UseCommunityNotificationsResult,
  SseHookResult,
  SseEventHookResult,
} from "./types";
import type { ManifestConfig } from "./ui/manifest/types";
import { bootBuiltins } from "./ui/manifest/boot-builtins";
import { compileManifestWithEnv } from "./ui/manifest/compiler";
import { getDefaultEnvSource } from "./ui/manifest/env";
import { registerComponent } from "./ui/manifest/component-registry";
import { registerComponentSchema } from "./ui/manifest/schema";
import type { PluginSetupContext } from "./plugin";

const MANIFEST_AUTH_WORKFLOW_EVENT = "snapshot:manifest-auth-workflow";
const MANIFEST_REALTIME_WORKFLOW_EVENT = "snapshot:manifest-realtime-workflow";

type ManifestAuthWorkflowKind = "unauthenticated" | "forbidden" | "logout";
type ManifestRealtimeWorkflowChannel = "ws" | "sse";

interface ManifestRealtimeWorkflowDetail {
  channel: ManifestRealtimeWorkflowChannel;
  kind: string;
  endpoint?: string;
  event?: string;
  payload?: unknown;
}

function dispatchManifestAuthWorkflow(kind: ManifestAuthWorkflowKind): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(MANIFEST_AUTH_WORKFLOW_EVENT, {
      detail: { kind },
    }),
  );
}

function dispatchManifestRealtimeWorkflow(
  detail: ManifestRealtimeWorkflowDetail,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(MANIFEST_REALTIME_WORKFLOW_EVENT, {
      detail,
    }),
  );
}

function resolveWebSocketUrl(apiUrl: string): string {
  if (apiUrl.startsWith("https:")) {
    return apiUrl.replace(/^https:/, "wss:");
  }

  if (apiUrl.startsWith("http:")) {
    return apiUrl.replace(/^http:/, "ws:");
  }

  return apiUrl;
}

function createManifestRealtimeCallback(
  detail: ManifestRealtimeWorkflowDetail,
  workflow: string | undefined,
  fallback?: () => void,
): (payload?: unknown) => void {
  return (payload) => {
    if (workflow && typeof window !== "undefined") {
      dispatchManifestRealtimeWorkflow({
        ...detail,
        payload,
      });
      return;
    }

    fallback?.();
  };
}

/**
 * Create a per-instance snapshot runtime from bootstrap config and a manifest.
 *
 * Resolves manifest env refs, builds per-instance runtime managers, and wires
 * manifest-driven auth/realtime workflow dispatch events.
 *
 * @param config - Four-field bootstrap config
 * @returns A fully initialized snapshot instance
 *
 * @example
 * ```ts
 * import { createSnapshot } from '@lastshotlabs/snapshot';
 * import manifest from './manifest.json';
 *
 * const snap = createSnapshot({
 *   apiUrl: 'https://api.example.com',
 *   manifest,
 * });
 *
 * // Use hooks in your React components
 * function App() {
 *   const { user } = snap.useUser();
 *   return user ? <div>Hello {user.email}</div> : <LoginForm />;
 * }
 * ```
 */
export function createSnapshot<
  TWSEvents extends Record<string, unknown> = Record<string, unknown>,
>(config: SnapshotConfig): SnapshotInstance<TWSEvents> {
  bootBuiltins();

  // ── Plugin registration ───────────────────────────────────────────────────
  const plugins = config.plugins ?? [];
  const seenTypeNames = new Set<string>();
  for (const plugin of plugins) {
    if (plugin.components) {
      for (const [typeName, entry] of Object.entries(plugin.components)) {
        if (seenTypeNames.has(typeName)) {
          console.warn(
            `[snapshot] Duplicate component type "${typeName}" registered by plugin "${plugin.name}". Later registration overrides earlier one.`,
          );
        }
        seenTypeNames.add(typeName);
        registerComponent(
          typeName,
          entry.component as Parameters<typeof registerComponent>[1],
        );
        registerComponentSchema(typeName, entry.schema);
      }
    }
  }

  // Merge plugin componentGroups into manifest before compilation
  let manifestWithPlugins = config.manifest;
  const pluginGroups = plugins.flatMap((p) =>
    p.componentGroups ? Object.entries(p.componentGroups) : [],
  );
  if (pluginGroups.length > 0) {
    const existingGroups = (manifestWithPlugins as Record<string, unknown>)[
      "componentGroups"
    ] as Record<string, unknown> | undefined;
    manifestWithPlugins = {
      ...manifestWithPlugins,
      componentGroups: {
        ...Object.fromEntries(pluginGroups),
        ...existingGroups,
      },
    } as typeof manifestWithPlugins;
  }

  const env = config.env ?? getDefaultEnvSource();
  const compiledManifest = compileManifestWithEnv(manifestWithPlugins, env);

  // ── Plugin setup hooks ────────────────────────────────────────────────────
  if (plugins.length > 0) {
    const workflowActions = new Map<string, (...args: unknown[]) => unknown>();
    const guards = new Map<string, (...args: unknown[]) => unknown>();
    const globalState = new Map<string, unknown>();

    const setupContext: PluginSetupContext = {
      manifest: Object.freeze({
        ...compiledManifest.raw,
      }) as PluginSetupContext["manifest"],
      registerWorkflowAction: (type, handler) => {
        workflowActions.set(type, handler);
      },
      registerGuard: (name, guard) => {
        guards.set(name, guard);
      },
      setGlobalState: (key, value) => {
        globalState.set(key, value);
      },
    };

    for (const plugin of plugins) {
      if (plugin.setup) {
        const result = plugin.setup(setupContext);
        if (result && typeof (result as Promise<void>).then === "function") {
          console.warn(
            `[snapshot] Plugin "${plugin.name}" setup() returned a Promise. Async setup is not awaited — use synchronous setup or manage the async lifecycle externally.`,
          );
        }
      }
    }
  }
  const runtimeApiUrl = compiledManifest.app.apiUrl ?? config.apiUrl;
  const runtimeRealtime = compiledManifest.realtime;
  const runtimeAuthMode = compiledManifest.auth?.session?.mode ?? "cookie";
  const runtimeSession = compiledManifest.auth?.session;
  const runtimeWsConfig = runtimeRealtime?.ws
    ? {
        url: runtimeRealtime.ws.url ?? resolveWebSocketUrl(runtimeApiUrl),
        autoReconnect:
          runtimeRealtime.ws.reconnect?.enabled ??
          runtimeRealtime.ws.autoReconnect,
        reconnectOnLogin: runtimeRealtime.ws.reconnectOnLogin,
        reconnectOnFocus: runtimeRealtime.ws.reconnectOnFocus,
        maxReconnectAttempts:
          runtimeRealtime.ws.reconnect?.maxAttempts ??
          runtimeRealtime.ws.maxReconnectAttempts,
        reconnectBaseDelay:
          runtimeRealtime.ws.reconnect?.baseDelay ??
          runtimeRealtime.ws.reconnectBaseDelay,
        reconnectMaxDelay:
          runtimeRealtime.ws.reconnect?.maxDelay ??
          runtimeRealtime.ws.reconnectMaxDelay,
        auth: runtimeRealtime.ws.auth
          ? {
              strategy: runtimeRealtime.ws.auth.strategy,
              paramName: runtimeRealtime.ws.auth.paramName,
              token: () => tokenStorage.get(),
            }
          : undefined,
        heartbeat: runtimeRealtime.ws.heartbeat
          ? {
              enabled: runtimeRealtime.ws.heartbeat.enabled,
              interval: runtimeRealtime.ws.heartbeat.interval,
              message: runtimeRealtime.ws.heartbeat.message,
            }
          : undefined,
        events: runtimeRealtime.ws.events,
        onConnected: createManifestRealtimeCallback(
          { channel: "ws", kind: "connected" },
          runtimeRealtime.ws.on?.connected,
        ),
        onDisconnected: createManifestRealtimeCallback(
          { channel: "ws", kind: "disconnected" },
          runtimeRealtime.ws.on?.disconnected,
        ),
        onReconnecting: createManifestRealtimeCallback(
          { channel: "ws", kind: "reconnecting" },
          runtimeRealtime.ws.on?.reconnecting,
        ),
        onReconnectFailed: createManifestRealtimeCallback(
          { channel: "ws", kind: "reconnectFailed" },
          runtimeRealtime.ws.on?.reconnectFailed,
        ),
      }
    : undefined;
  const runtimeSseConfig = runtimeRealtime?.sse
    ? {
        reconnectOnLogin: runtimeRealtime.sse.reconnectOnLogin,
        endpoints: Object.fromEntries(
          Object.entries(runtimeRealtime.sse.endpoints).map(
            ([path, manifestEndpoint]) =>
              [
                path,
                {
                  withCredentials: manifestEndpoint.withCredentials,
                  events: manifestEndpoint.events,
                  onConnected: createManifestRealtimeCallback(
                    { channel: "sse", kind: "connected", endpoint: path },
                    manifestEndpoint.on?.connected,
                  ),
                  onError: createManifestRealtimeCallback(
                    { channel: "sse", kind: "error", endpoint: path },
                    manifestEndpoint.on?.error,
                  ),
                  onClosed: createManifestRealtimeCallback(
                    { channel: "sse", kind: "closed", endpoint: path },
                    manifestEndpoint.on?.closed,
                  ),
                },
              ] as const,
          ),
        ),
      }
    : undefined;
  const loginScreenPath = compiledManifest.auth
    ? getAuthScreenPath(compiledManifest, "login")
    : undefined;
  const mfaScreenPath = compiledManifest.auth
    ? getAuthScreenPath(compiledManifest, "mfa")
    : undefined;
  const homeScreenPath =
    compiledManifest.app.home ?? compiledManifest.firstRoute?.path;
  const loaderLoginPath =
    compiledManifest.auth?.redirects?.unauthenticated ?? loginScreenPath;

  function createManifestAuthCallback(
    kind: ManifestAuthWorkflowKind,
  ): () => void {
    return () => {
      if (compiledManifest.auth?.on?.[kind] && typeof window !== "undefined") {
        dispatchManifestAuthWorkflow(kind);
        return;
      }
    };
  }

  // ── Auth contract ────────────────────────────────────────────────────────────
  const contract = mergeContract(
    runtimeApiUrl,
    compiledManifest.auth?.contract as Parameters<typeof mergeContract>[1],
  );

  // ── API client ──────────────────────────────────────────────────────────────
  const api = new ApiClient({
    apiUrl: runtimeApiUrl,
    auth: runtimeAuthMode,
    bearerToken: config.bearerToken,
    onUnauthenticated: createManifestAuthCallback("unauthenticated"),
    onForbidden: createManifestAuthCallback("forbidden"),
    contract,
  });

  // ── Token storage ───────────────────────────────────────────────────────────
  const tokenStorage = createTokenStorage({
    auth: runtimeAuthMode,
    tokenStorage: runtimeSession?.storage,
    tokenKey: runtimeSession?.key,
  });
  api.setStorage(tokenStorage);

  // ── Query client (stable singleton) ────────────────────────────────────────
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: compiledManifest.app.cache?.staleTime ?? 5 * 60 * 1000,
        gcTime: compiledManifest.app.cache?.gcTime ?? 10 * 60 * 1000,
        retry: compiledManifest.app.cache?.retry ?? 1,
      },
    },
  });

  // ── Security posture warnings ─────────────────────────────────────────────
  // Warning 4: verbose auth errors enabled on non-localhost

  if (false) {
  }

  // ── WebSocket manager (created once if ws config present) ──────────────────
  let wsManager: WebSocketManager<TWSEvents> | null = null;
  if (runtimeWsConfig) {
    wsManager = new WebSocketManager<TWSEvents>(runtimeWsConfig);
  }

  // ── SSE registry — one SseManager per configured endpoint ─────────────────
  // Key: endpoint path (e.g. '/__sse/feed'), Value: { manager, url }
  const sseRegistry = new Map<string, { manager: SseManager; url: string }>();

  if (runtimeSseConfig) {
    const { endpoints } = runtimeSseConfig;
    for (const [path, endpointCfg] of Object.entries(endpoints)) {
      const url = `${runtimeApiUrl}${path}`;
      const manager = new SseManager({
        withCredentials: endpointCfg.withCredentials,
        onConnected: endpointCfg.onConnected,
        onError: endpointCfg.onError,
        onClosed: endpointCfg.onClosed,
      });
      manager.connect(url);
      for (const [event, workflow] of Object.entries(
        endpointCfg.events ?? {},
      )) {
        const dispatch = createManifestRealtimeCallback(
          { channel: "sse", kind: event, event, endpoint: path },
          workflow,
        );
        manager.on(event, (payload) => dispatch(payload));
      }
      sseRegistry.set(path, { manager, url });
    }
  }

  if (wsManager && runtimeRealtime?.ws?.events) {
    for (const [event, workflow] of Object.entries(runtimeRealtime.ws.events)) {
      const dispatch = createManifestRealtimeCallback(
        { channel: "ws", kind: event, event },
        workflow,
      );
      wsManager.on(event as keyof TWSEvents, (payload) => dispatch(payload));
    }
  }

  // ── Per-instance pending MFA challenge atom ──────────────────────────────────
  const pendingMfaChallengeAtom = atom<MfaChallenge | null>(null);

  function usePendingMfaChallenge(): MfaChallenge | null {
    return useAtomValue(pendingMfaChallengeAtom);
  }

  // ── Community hooks ──────────────────────────────────────────────────────────
  const communityHooks = createCommunityHooks({ api, queryClient });

  // ── Webhook hooks ────────────────────────────────────────────────────────────
  const webhookHooks = createWebhookHooks({ api, queryClient });

  // ── WS hooks ────────────────────────────────────────────────────────────────
  const { useSocket, useRoom, useRoomEvent } = createWsHooks<TWSEvents>();

  // Hook that initializes the atom on first render and returns the manager
  function useWebSocketManagerWithInit(): WebSocketManager<TWSEvents> | null {
    const [current, setManager] = useAtom(wsManagerAtom);
    // Initialize atom on first use
    if (wsManager !== null && current === null) {
      setManager(wsManager);
    }
    return current as WebSocketManager<TWSEvents> | null;
  }

  // ── SSE hooks (per-endpoint, closure-backed, no shared atoms) ────────────────

  /**
   * useSSE(endpoint) — returns { status } for the given endpoint path.
   * Re-renders whenever the connection status changes.
   */
  function useSSE(endpoint: string): SseHookResult {
    const entry = sseRegistry.get(endpoint);
    const [status, setStatus] = useState<SseConnectionStatus>(
      entry ? entry.manager.state : "closed",
    );

    useEffect(() => {
      if (!entry) return;
      const { manager } = entry;

      // Poll status changes by hooking into open/error/close via a thin wrapper.
      // SseManager doesn't expose a status-change callback directly, so we
      // subscribe to the internal EventSource events via a no-op listener on 'open'
      // and 'error'. We read manager.state after each event.
      const es = (manager as unknown as { es: EventSource | null }).es;

      if (!es) {
        setStatus(manager.state);
        return;
      }

      const onOpen = () => setStatus("open");
      const onError = () => setStatus(manager.state);

      es.addEventListener("open", onOpen);
      es.addEventListener("error", onError);

      setStatus(manager.state);

      return () => {
        es.removeEventListener("open", onOpen);
        es.removeEventListener("error", onError);
      };
    }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

    return { status };
  }

  /**
   * useSseEvent<T>(endpoint, event) — subscribes to a named event on the given
   * endpoint. Returns { data: T | null; status }.
   *
   * data is updated each time the event fires. status mirrors the endpoint's
   * connection state.
   */
  function useSseEvent<T = unknown>(
    endpoint: string,
    event: string,
  ): SseEventHookResult<T> {
    const entry = sseRegistry.get(endpoint);
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<SseConnectionStatus>(
      entry ? entry.manager.state : "closed",
    );

    // Stable handler ref so useEffect deps don't re-run on every render
    const setDataRef = useRef(setData);
    setDataRef.current = setData;

    useEffect(() => {
      if (!entry) return;
      const { manager } = entry;

      const handler = (payload: unknown) => {
        setDataRef.current(payload as T);
      };

      manager.on(event, handler);
      setStatus(manager.state);

      // Status tracking via EventSource events
      const es = (manager as unknown as { es: EventSource | null }).es;
      const onOpen = () => setStatus("open");
      const onError = () => setStatus(manager.state);

      if (es) {
        es.addEventListener("open", onOpen);
        es.addEventListener("error", onError);
      }

      return () => {
        manager.off(event, handler);
        if (es) {
          es.removeEventListener("open", onOpen);
          es.removeEventListener("error", onError);
        }
      };
    }, [endpoint, event]); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, status };
  }

  // ── Community notifications hook ─────────────────────────────────────────────
  // Closure-backed — captures api and sseRegistry from factory scope.
  // Requires sse.endpoints to include '/__sse/notifications'.
  const NOTIFICATIONS_ENDPOINT = "/__sse/notifications";

  function useCommunityNotifications(
    opts?: UseCommunityNotificationsOpts,
  ): UseCommunityNotificationsResult {
    const apiBase = opts?.apiBase ?? "/community/notifications";
    const [notifications, setNotifications] = useState<CommunityNotification[]>(
      [],
    );
    const [isConnected, setIsConnected] = useState(false);

    const notifEntry = sseRegistry.get(NOTIFICATIONS_ENDPOINT);
    const sseManager = notifEntry?.manager ?? null;

    const fetchNotifications = useCallback(async (): Promise<
      CommunityNotification[]
    > => {
      try {
        const result = await api.get<{
          items: CommunityNotification[];
          nextCursor?: string;
        }>(apiBase);
        const items = result.items;
        setNotifications(items);
        setIsConnected(sseManager?.state === "open");
        return items;
      } catch {
        return [];
      }
    }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      setIsConnected(sseManager?.state === "open");
      void fetchNotifications();
    }, [fetchNotifications]); // eslint-disable-line react-hooks/exhaustive-deps

    // Internal SSE listener for community:notification.created
    useEffect(() => {
      if (!sseManager) return;
      const handler = async () => {
        const fresh = await fetchNotifications();
        // Layer 2: show native notification if tab is not visible and permission is granted
        if (
          fresh.length > 0 &&
          typeof document !== "undefined" &&
          document.visibilityState !== "visible" &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          const newest = fresh.find((n) => !n.read);
          if (newest) {
            const title =
              newest.type === "reply"
                ? "New reply to your thread"
                : newest.type === "mention"
                  ? "You were mentioned"
                  : "Account update";
            new Notification(title);
          }
        }
      };

      sseManager.on("community:notification.created", handler);
      return () => {
        sseManager.off("community:notification.created", handler);
      };
    }, [fetchNotifications]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      isConnected,
      markRead: async (id: string) => {
        await api.put<{ success: boolean }>(`${apiBase}/${id}/read`, undefined);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      },
      markAllRead: async () => {
        await api.post<{ success: boolean }>(`${apiBase}/read-all`, undefined);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },
    };
  }

  // ── Helper: reconnect / close all SSE endpoints ───────────────────────────
  function reconnectAllSse(): void {
    for (const [, { manager, url }] of sseRegistry) {
      manager.connect(url);
    }
  }

  function closeAllSse(): void {
    for (const [, { manager }] of sseRegistry) {
      manager.close();
    }
  }

  /**
   * onSseEvent(endpoint, event, handler) — imperative subscription to a named
   * SSE event on the given endpoint. Uses the shared SseManager (no new
   * EventSource is opened). Returns an unsubscribe function.
   *
   * Intended for use inside useEffect when multiple events need to be
   * subscribed in a single hook (e.g. bulk invalidation tables that can't use
   * the rules-of-hooks-safe useSseEvent in a loop).
   */
  function onSseEvent(
    endpoint: string,
    event: string,
    handler: (payload: unknown) => void,
  ): () => void {
    const entry = sseRegistry.get(endpoint);
    if (!entry) return () => {};
    entry.manager.on(event, handler);
    return () => entry.manager.off(event, handler);
  }

  // ── Auth hooks ──────────────────────────────────────────────────────────────
  const { useUser, useLogin, useLogout, useRegister, useForgotPassword } =
    createAuthHooks({
      api,
      storage: tokenStorage,
      config: {
        auth: runtimeAuthMode,
        staleTime: compiledManifest.app.cache?.staleTime,
        loginPath: loginScreenPath,
        homePath: homeScreenPath,
        mfaPath: mfaScreenPath,
        onLogoutSuccess: createManifestAuthCallback("logout"),
      },
      contract,
      pendingMfaChallengeAtom,
      onLoginSuccess: () => {
        if (runtimeWsConfig?.reconnectOnLogin !== false) wsManager?.reconnect();
        if (runtimeSseConfig?.reconnectOnLogin !== false) reconnectAllSse();
      },
      onLogoutSuccess: () => closeAllSse(),
    });

  // ── MFA hooks ──────────────────────────────────────────────────────────────
  const mfaHooks = createMfaHooks({
    api,
    storage: tokenStorage,
    config: {
      auth: runtimeAuthMode,
      homePath: homeScreenPath,
      staleTime: compiledManifest.app.cache?.staleTime,
      mfa: compiledManifest.auth?.mfa,
    },
    contract,
    pendingMfaChallengeAtom,
    onLoginSuccess: () => {
      if (runtimeWsConfig?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (runtimeSseConfig?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── Account hooks ──────────────────────────────────────────────────────────
  const accountHooks = createAccountHooks({
    api,
    storage: tokenStorage,
    config: {
      loginPath: loginScreenPath,
    },
    contract,
    onUnauthenticated: createManifestAuthCallback("unauthenticated"),
    queryClient,
  });

  // ── OAuth hooks ─────────────────────────────────────────────────────────────
  const oauthHooks = createOAuthHooks({
    api,
    storage: tokenStorage,
    config: {
      auth: runtimeAuthMode,
      homePath: homeScreenPath,
      providers: compiledManifest.auth?.providers,
    },
    contract,
    onLoginSuccess: () => {
      if (runtimeWsConfig?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (runtimeSseConfig?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── WebAuthn hooks ──────────────────────────────────────────────────────────
  const webAuthnHooks = createWebAuthnHooks({
    api,
    storage: tokenStorage,
    config: {
      auth: runtimeAuthMode,
      homePath: homeScreenPath,
      mfaPath: mfaScreenPath,
      webauthn: compiledManifest.auth?.webauthn,
    },
    contract,
    pendingMfaChallengeAtom,
    onLoginSuccess: () => {
      if (runtimeWsConfig?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (runtimeSseConfig?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── Routing ─────────────────────────────────────────────────────────────────
  const { protectedBeforeLoad, guestBeforeLoad } = createLoaders(
    {
      loginPath: loaderLoginPath,
      homePath: homeScreenPath,
      onUnauthenticated: createManifestAuthCallback("unauthenticated"),
      staleTime: compiledManifest.app.cache?.staleTime,
    },
    api,
    contract,
  );

  // ── Auth error formatter ────────────────────────────────────────────────────
  const boundFormatAuthError = createAuthErrorFormatter();

  // ── QueryProvider pre-bound to this instance's queryClient ─────────────────
  function QueryProvider({ children }: { children: ReactNode }) {
    return (
      <QueryProviderInner client={queryClient}>{children}</QueryProviderInner>
    );
  }

  // ── ManifestApp (created when manifest config is provided) ──────────────────
  let ManifestAppComponent: React.ComponentType | undefined;
  if (compiledManifest.raw) {
    const capturedApiUrl = runtimeApiUrl;
    const capturedManifest = compiledManifest.raw;
    ManifestAppComponent = function SnapshotManifestApp() {
      // Lazy import to avoid pulling UI code into SDK-only consumers.
      const { ManifestApp: ManifestAppImpl } = require("./ui/manifest/app") as {
        ManifestApp: React.ComponentType<{
          manifest: ManifestConfig;
          apiUrl: string;
        }>;
      };
      return (
        <ManifestAppImpl manifest={capturedManifest} apiUrl={capturedApiUrl} />
      );
    };
  }

  return {
    bootstrap: {
      env,
      bearerToken: config.bearerToken,
    },
    // High-level hooks
    useUser,
    useLogin,
    useLogout,
    useRegister,
    useForgotPassword,
    useSocket,
    useRoom,
    useRoomEvent,
    useTheme,

    // MFA
    usePendingMfaChallenge,
    ...mfaHooks,
    isMfaChallenge,

    // Account
    ...accountHooks,

    // OAuth
    ...oauthHooks,

    // WebAuthn
    ...webAuthnHooks,

    // Auth error formatting
    formatAuthError: boundFormatAuthError,

    // SSE — per-endpoint hooks
    useSSE,
    useSseEvent,
    onSseEvent,
    useCommunityNotifications,

    // Community hooks
    ...communityHooks,

    // Webhook hooks
    ...webhookHooks,

    // Primitives
    api,
    tokenStorage,
    queryClient,
    useWebSocketManager: useWebSocketManagerWithInit,

    // Routing
    protectedBeforeLoad,
    guestBeforeLoad,

    // Components
    QueryProvider,

    // Config-driven UI
    ManifestApp: ManifestAppComponent,
  };
}
