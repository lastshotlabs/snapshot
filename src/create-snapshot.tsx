import { QueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { ApiClient } from "./api/client";
import { createTokenStorage } from "./auth/storage";
import { setRuntimeNavigator } from "./auth/navigation";
import type { Navigator } from "./auth/navigation";
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
import type {
  SnapshotConfig,
  SnapshotInstance,
  CommunityNotification,
  UseCommunityNotificationsOpts,
  UseCommunityNotificationsResult,
  SseHookResult,
  SseEventHookResult,
} from "./types";

function resolveWebSocketUrl(apiUrl: string): string {
  if (apiUrl.startsWith("https:")) {
    return apiUrl.replace(/^https:/, "wss:");
  }

  if (apiUrl.startsWith("http:")) {
    return apiUrl.replace(/^http:/, "ws:");
  }

  return apiUrl;
}

/**
 * Create a per-instance Snapshot runtime from code-first bootstrap config.
 *
 * Builds per-instance API, auth, realtime, community, and webhook hooks from
 * explicit TypeScript config.
 *
 * @param config - Code-first Snapshot runtime config
 * @returns A fully initialized snapshot instance
 *
 * @example
 * ```ts
 * import { createSnapshot } from '@lastshotlabs/snapshot';
 *
 * const snap = createSnapshot({
 *   apiUrl: 'https://api.example.com',
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
  const runtimeApiUrl = config.apiUrl;
  const runtimeAuthMode = config.auth?.session?.mode ?? "cookie";
  const runtimeSession = config.auth?.session;
  const runtimeWsConfig = config.ws
    ? {
        url: config.ws.url ?? resolveWebSocketUrl(runtimeApiUrl),
        autoReconnect: config.ws.autoReconnect,
        reconnectOnLogin: config.ws.reconnectOnLogin,
        reconnectOnFocus: config.ws.reconnectOnFocus,
        maxReconnectAttempts: config.ws.maxReconnectAttempts,
        reconnectBaseDelay: config.ws.reconnectBaseDelay,
        reconnectMaxDelay: config.ws.reconnectMaxDelay,
        auth: config.ws.auth
          ? {
              strategy: config.ws.auth.strategy,
              paramName: config.ws.auth.paramName,
              token: () => tokenStorage.get(),
            }
          : undefined,
        heartbeat: config.ws.heartbeat,
        onConnected: config.ws.onConnected,
        onDisconnected: config.ws.onDisconnected,
        onReconnecting: config.ws.onReconnecting,
        onReconnectFailed: config.ws.onReconnectFailed,
      }
    : undefined;
  const runtimeSseConfig = config.sse;
  const loginScreenPath = config.loginPath;
  const homeScreenPath = config.homePath;
  const mfaScreenPath = config.mfaPath;
  const loaderLoginPath = config.loginPath;

  function createAuthCallback(
    kind: "unauthenticated" | "forbidden" | "logout",
  ): () => void {
    return () => {
      config.auth?.on?.[kind]?.();
    };
  }

  // ── Auth contract ────────────────────────────────────────────────────────────
  const contract = mergeContract(runtimeApiUrl, config.auth?.contract);

  // ── API client ──────────────────────────────────────────────────────────────
  const api = new ApiClient({
    apiUrl: runtimeApiUrl,
    auth: runtimeAuthMode,
    bearerToken: config.bearerToken,
    onUnauthenticated: createAuthCallback("unauthenticated"),
    onForbidden: createAuthCallback("forbidden"),
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
        staleTime: config.cache?.staleTime ?? 5 * 60 * 1000,
        gcTime: config.cache?.gcTime ?? 10 * 60 * 1000,
        retry: config.cache?.retry ?? 1,
      },
    },
  });

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
      for (const [event, handler] of Object.entries(endpointCfg.events ?? {})) {
        manager.on(event, handler);
      }
      sseRegistry.set(path, { manager, url });
    }
  }

  if (wsManager && config.ws?.events) {
    for (const [event, handler] of Object.entries(config.ws.events)) {
      wsManager.on(event as keyof TWSEvents, (payload) => handler(payload));
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
        staleTime: config.cache?.staleTime,
        loginPath: loginScreenPath,
        homePath: homeScreenPath,
        mfaPath: mfaScreenPath,
        onLogoutSuccess: createAuthCallback("logout"),
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
        staleTime: config.cache?.staleTime,
        mfa: config.auth?.mfa,
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
    onUnauthenticated: createAuthCallback("unauthenticated"),
    queryClient,
  });

  // ── OAuth hooks ─────────────────────────────────────────────────────────────
  const oauthHooks = createOAuthHooks({
    api,
    storage: tokenStorage,
    config: {
      auth: runtimeAuthMode,
      homePath: homeScreenPath,
      providers: config.auth?.providers,
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
      webauthn: config.auth?.webauthn,
    },
    contract,
    pendingMfaChallengeAtom,
    onLoginSuccess: () => {
      if (runtimeWsConfig?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (runtimeSseConfig?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── Routing ─────────────────────────────────────────────────────────────────
  const { protectedBeforeLoad, guestBeforeLoad, protect, guest } = createLoaders(
    {
      loginPath: loaderLoginPath,
      homePath: homeScreenPath,
      onUnauthenticated: createAuthCallback("unauthenticated"),
      staleTime: config.cache?.staleTime,
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

  return {
    bootstrap: {
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
    protect,
    guest,
    /**
     * Register a router-aware navigator. Auth hooks (`useLogout`,
     * `useDeleteAccount`, OAuth/MFA flows) call this for post-mutation
     * redirects so the router actually transitions instead of falling through
     * to `pushState + popstate` (which TanStack Router ignores).
     *
     * Pass `null` to clear the navigator (e.g. on app teardown).
     */
    setNavigator: (nav: Navigator | null) => setRuntimeNavigator(nav),

    // Components
    QueryProvider,
  };
}
