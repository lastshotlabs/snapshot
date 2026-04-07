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
import { warnOnce } from "./auth/warnings";
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
import { mergeContract } from "./auth/contract";

export function createSnapshot<
  TWSEvents extends Record<string, unknown> = Record<string, unknown>,
>(config: SnapshotConfig): SnapshotInstance<TWSEvents> {
  // ── Auth contract ────────────────────────────────────────────────────────────
  const contract = mergeContract(config.apiUrl, config.contract);

  // ── API client ──────────────────────────────────────────────────────────────
  const api = new ApiClient({
    apiUrl: config.apiUrl,
    auth: config.auth,
    bearerToken: config.bearerToken,
    onUnauthenticated: config.onUnauthenticated,
    onForbidden: config.onForbidden,
    onMfaSetupRequired: config.mfaSetupPath
      ? () => {
          window.location.href = config.mfaSetupPath!;
        }
      : undefined,
    contract,
  });

  // ── Token storage ───────────────────────────────────────────────────────────
  const tokenStorage = createTokenStorage({
    auth: config.auth,
    tokenStorage: config.tokenStorage,
    tokenKey: config.tokenKey,
  });
  api.setStorage(tokenStorage);

  // ── Query client (stable singleton) ────────────────────────────────────────
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: config.staleTime ?? 5 * 60 * 1000,
        gcTime: config.gcTime ?? 10 * 60 * 1000,
        retry: config.retry ?? 1,
      },
    },
  });

  // ── Security posture warnings ─────────────────────────────────────────────
  // Warning 4: verbose auth errors enabled on non-localhost
  const authErrorsConfig = (config as unknown as Record<string, unknown>)
    .authErrors as { verbose?: boolean } | undefined;
  if (authErrorsConfig?.verbose === true && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";
    if (!isLocal) {
      warnOnce(
        "auth-errors:verbose-on-non-localhost",
        "[snapshot] Verbose error messages enabled on non-localhost origin. " +
          "Set authErrors.verbose: false for production deployments.",
      );
    }
  }

  // ── WebSocket manager (created once if ws config present) ──────────────────
  let wsManager: WebSocketManager<TWSEvents> | null = null;
  if (config.ws) {
    wsManager = new WebSocketManager<TWSEvents>(config.ws);
  }

  // ── SSE registry — one SseManager per configured endpoint ─────────────────
  // Key: endpoint path (e.g. '/__sse/feed'), Value: { manager, url }
  const sseRegistry = new Map<string, { manager: SseManager; url: string }>();

  if (config.sse) {
    const { endpoints } = config.sse;
    for (const [path, endpointCfg] of Object.entries(endpoints)) {
      const url = `${config.apiUrl}${path}`;
      const manager = new SseManager({
        withCredentials: endpointCfg.withCredentials,
        onConnected: endpointCfg.onConnected,
        onError: endpointCfg.onError,
        onClosed: endpointCfg.onClosed,
      });
      manager.connect(url);
      sseRegistry.set(path, { manager, url });
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
  const { useWebSocketManager, useSocket, useRoom, useRoomEvent } =
    createWsHooks<TWSEvents>();

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
      config,
      contract,
      pendingMfaChallengeAtom,
      onLoginSuccess: () => {
        if (config.ws?.reconnectOnLogin !== false) wsManager?.reconnect();
        if (config.sse?.reconnectOnLogin !== false) reconnectAllSse();
      },
      onLogoutSuccess: () => closeAllSse(),
    });

  // ── MFA hooks ──────────────────────────────────────────────────────────────
  const mfaHooks = createMfaHooks({
    api,
    storage: tokenStorage,
    config,
    contract,
    pendingMfaChallengeAtom,
    onLoginSuccess: () => {
      if (config.ws?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (config.sse?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── Account hooks ──────────────────────────────────────────────────────────
  const accountHooks = createAccountHooks({
    api,
    storage: tokenStorage,
    config,
    contract,
    onUnauthenticated: config.onUnauthenticated,
    queryClient,
  });

  // ── OAuth hooks ─────────────────────────────────────────────────────────────
  const oauthHooks = createOAuthHooks({
    api,
    storage: tokenStorage,
    config,
    contract,
    onLoginSuccess: () => {
      if (config.ws?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (config.sse?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── WebAuthn hooks ──────────────────────────────────────────────────────────
  const webAuthnHooks = createWebAuthnHooks({
    api,
    storage: tokenStorage,
    config,
    contract,
    pendingMfaChallengeAtom,
    onLoginSuccess: () => {
      if (config.ws?.reconnectOnLogin !== false) wsManager?.reconnect();
      if (config.sse?.reconnectOnLogin !== false) reconnectAllSse();
    },
  });

  // ── Routing ─────────────────────────────────────────────────────────────────
  const { protectedBeforeLoad, guestBeforeLoad } = createLoaders(
    config,
    api,
    contract,
  );

  // ── Auth error formatter ────────────────────────────────────────────────────
  const boundFormatAuthError = createAuthErrorFormatter(config.authErrors);

  // ── QueryProvider pre-bound to this instance's queryClient ─────────────────
  function QueryProvider({ children }: { children: ReactNode }) {
    return (
      <QueryProviderInner client={queryClient}>{children}</QueryProviderInner>
    );
  }

  // ── ManifestApp (created when manifest config is provided) ──────────────────
  let ManifestAppComponent: React.ComponentType | undefined;
  if (config.manifest) {
    const manifestConfig = config.manifest as unknown as ManifestConfig;
    // Lazy import to avoid pulling UI code into SDK-only consumers
    const { ManifestApp: ManifestAppImpl } = require("./ui/manifest/app") as {
      ManifestApp: React.ComponentType<{
        manifest: ManifestConfig;
        apiUrl: string;
      }>;
    };
    const capturedApiUrl = config.apiUrl;
    const capturedManifest = manifestConfig;
    ManifestAppComponent = function SnapshotManifestApp() {
      return (
        <ManifestAppImpl manifest={capturedManifest} apiUrl={capturedApiUrl} />
      );
    };
  }

  return {
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
