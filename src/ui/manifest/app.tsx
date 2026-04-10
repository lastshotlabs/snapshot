/**
 * ManifestApp — renders an entire application from a manifest config.
 */

import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createSnapshot } from "../../create-snapshot";
import { SnapshotApiContext, useActionExecutor } from "../actions/executor";
import {
  AppContextProvider,
  useResolveFrom,
  useSubscribe,
} from "../context/index";
import { Nav } from "../components/layout/nav";
import { DrawerComponent } from "../components/overlay/drawer";
import { ModalComponent } from "../components/overlay/modal";
import { useSetStateValue } from "../state";
import { resolveTokens } from "../tokens/resolve";
import {
  createManifestAuthRuntimeConfig,
  ManifestAuthScreen,
  resolveAuthScreen,
} from "./auth";
import { getAuthScreenPath } from "./auth-routes";
import { compileManifest } from "./compiler";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
  useManifestResourceCache,
} from "./runtime";
import { resolveDocumentTitle, resolveRouteMatch } from "./router";
import { ComponentRenderer, PageRenderer } from "./renderer";
import type { EndpointTarget } from "./resources";
import type {
  ComponentConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestAppProps,
  OverlayConfig,
} from "./types";

/**
 * Inject or update a stylesheet in the document head.
 *
 * @param id - Stable style element id
 * @param css - CSS text to inject
 */
export function injectStyleSheet(id: string, css: string): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function evaluateRouteGuard(
  route: CompiledRoute | null,
  user: Record<string, unknown> | null,
  resolvedCondition: unknown,
): boolean {
  if (!route?.guard) {
    return true;
  }

  const roles = [
    ...(typeof user?.["role"] === "string" ? [String(user["role"])] : []),
    ...(Array.isArray(user?.["roles"])
      ? (user?.["roles"] as unknown[]).map((value) => String(value))
      : []),
  ];

  if (route.guard.authenticated && !user) {
    return false;
  }

  if (
    route.guard.roles &&
    route.guard.roles.length > 0 &&
    !route.guard.roles.some((role) => roles.includes(role))
  ) {
    return false;
  }

  if (route.guard.condition) {
    const operator = route.guard.condition.operator ?? "truthy";
    const left =
      resolvedCondition && typeof resolvedCondition === "object"
        ? (resolvedCondition as Record<string, unknown>)["left"]
        : undefined;
    const right =
      resolvedCondition && typeof resolvedCondition === "object"
        ? (resolvedCondition as Record<string, unknown>)["right"]
        : undefined;

    switch (operator) {
      case "falsy":
        return !left;
      case "equals":
        return left === right;
      case "not-equals":
        return left !== right;
      case "exists":
        return left !== undefined && left !== null;
      default:
        return Boolean(left);
    }
  }

  return true;
}

function withRedirectParam(path: string, redirectTo: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  const origin =
    window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "http://localhost";
  const url = new URL(path, origin);
  url.searchParams.set("redirect", redirectTo);
  return `${url.pathname}${url.search}`;
}

function dispatchPopState(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof PopStateEvent === "function") {
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  window.dispatchEvent(new Event("popstate"));
}

/**
 * Merge route preload params with explicit override params.
 *
 * @param target - Resource target or target descriptor
 * @param params - Route params to merge into the target
 * @returns The resolved preload target
 */
export function resolveRoutePreloadTarget(
  target: EndpointTarget,
  params: Record<string, string>,
): {
  target: EndpointTarget;
  params?: Record<string, unknown>;
} {
  if (typeof target === "string") {
    return {
      target,
      params,
    };
  }

  return {
    target: {
      ...target,
      params: {
        ...params,
        ...(target.params ?? {}),
      },
    },
  };
}

type AppFallbackName = "loading" | "error" | "notFound" | "offline";

const FALLBACK_COMPONENT_TYPES: Record<AppFallbackName, string> = {
  loading: "spinner",
  error: "error-page",
  notFound: "not-found",
  offline: "offline-banner",
};

function resolveRouteByTarget(
  manifest: CompiledManifest,
  target: string,
): CompiledRoute | null {
  const byId = manifest.routes.find((route) => route.id === target);
  if (byId) {
    return byId;
  }

  return null;
}

function AppFallback({
  manifest,
  name,
  api,
}: {
  manifest: CompiledManifest;
  name: AppFallbackName;
  api?: ReturnType<typeof createSnapshot>["api"];
}) {
  const configured = manifest.app[name];

  if (typeof configured === "string") {
    const targetRoute = resolveRouteByTarget(manifest, configured);
    if (targetRoute) {
      return (
        <PageRenderer
          page={targetRoute.page}
          routeId={targetRoute.id}
          state={manifest.state}
          resources={manifest.resources}
          api={api}
        />
      );
    }
  }

  if (configured && typeof configured === "object" && "type" in configured) {
    return <ComponentRenderer config={configured as ComponentConfig} />;
  }

  return (
    <ComponentRenderer
      config={{ type: FALLBACK_COMPONENT_TYPES[name] } as ComponentConfig}
    />
  );
}

class ManifestErrorBoundary extends Component<
  {
    fallback: ReactNode;
    onError: (error: Error) => void;
    children: ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function applyRouteResourceInvalidations(
  resourceCache: ReturnType<typeof useManifestResourceCache>,
  resourceNames?: string[],
): void {
  if (!resourceCache || !resourceNames) {
    return;
  }

  for (const resourceName of resourceNames) {
    resourceCache.invalidateResource(resourceName);
  }
}

function AuthRuntimeBridge({
  manifest,
  useUser,
}: {
  manifest: CompiledManifest;
  useUser: ReturnType<typeof createSnapshot>["useUser"];
}) {
  const setUser = useSetStateValue("user", { scope: "app" });
  const setAuth = useSetStateValue("auth", { scope: "app" });
  const { user, isLoading, isError } = useUser();

  useEffect(() => {
    if (!manifest.auth) {
      return;
    }

    setUser(user ?? null);
    setAuth({
      user: user ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      isError,
      screens: manifest.auth.screens,
    });
  }, [isError, isLoading, manifest.auth, setAuth, setUser, user]);

  return null;
}

const MANIFEST_AUTH_WORKFLOW_EVENT = "snapshot:manifest-auth-workflow";
const MANIFEST_REALTIME_WORKFLOW_EVENT =
  "snapshot:manifest-realtime-workflow";
const useManifestLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function ManifestAuthWorkflowBridge({
  manifest,
}: {
  manifest: CompiledManifest;
}) {
  const execute = useActionExecutor();

  useManifestLayoutEffect(() => {
    const authWorkflows = manifest.auth?.on;
    if (!authWorkflows) {
      return;
    }

    const onAuthWorkflowEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string }>).detail;
      const kind = detail?.kind;
      if (!kind) {
        return;
      }

      const workflow = authWorkflows[kind as keyof typeof authWorkflows];
      if (!workflow) {
        return;
      }

      void execute(
        { type: "run-workflow", workflow },
        {
          auth: {
            kind,
          },
        },
      );
    };

    window.addEventListener(
      MANIFEST_AUTH_WORKFLOW_EVENT,
      onAuthWorkflowEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        MANIFEST_AUTH_WORKFLOW_EVENT,
        onAuthWorkflowEvent as EventListener,
      );
    };
  }, [execute, manifest.auth?.on]);

  return null;
}

type ManifestRealtimeWorkflowChannel = "ws" | "sse";
type ManifestRealtimeWorkflowKind =
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "reconnectFailed"
  | "error"
  | "closed";

interface ManifestRealtimeWorkflowDetail {
  channel: ManifestRealtimeWorkflowChannel;
  kind: ManifestRealtimeWorkflowKind;
  endpoint?: string;
}

function resolveManifestRealtimeWorkflow(
  manifest: CompiledManifest,
  detail: ManifestRealtimeWorkflowDetail,
): string | undefined {
  if (detail.channel === "ws") {
    return (
      manifest.realtime?.ws?.on as Record<string, string | undefined> | undefined
    )?.[detail.kind];
  }

  if (!detail.endpoint) {
    return undefined;
  }

  return (
    manifest.realtime?.sse?.endpoints?.[detail.endpoint]?.on as
      | Record<string, string | undefined>
      | undefined
  )?.[detail.kind];
}

function ManifestRealtimeWorkflowBridge({
  manifest,
}: {
  manifest: CompiledManifest;
}) {
  const execute = useActionExecutor();

  useManifestLayoutEffect(() => {
    if (!manifest.realtime) {
      return;
    }

    const onRealtimeWorkflowEvent = (event: Event) => {
      const detail = (
        event as CustomEvent<ManifestRealtimeWorkflowDetail>
      ).detail;
      if (!detail) {
        return;
      }

      const workflow = resolveManifestRealtimeWorkflow(manifest, detail);
      if (!workflow) {
        return;
      }

      void execute(
        { type: "run-workflow", workflow },
        {
          realtime: detail,
        },
      );
    };

    window.addEventListener(
      MANIFEST_REALTIME_WORKFLOW_EVENT,
      onRealtimeWorkflowEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        MANIFEST_REALTIME_WORKFLOW_EVENT,
        onRealtimeWorkflowEvent as EventListener,
      );
    };
  }, [execute, manifest]);

  return null;
}

function OverlayHost({
  overlays,
}: {
  overlays?: Record<string, OverlayConfig>;
}) {
  if (!overlays) {
    return null;
  }

  return (
    <>
      {Object.entries(overlays).map(([id, overlay]) => {
        if (overlay.type === "drawer") {
          return (
            <DrawerComponent
              key={id}
              config={
                { ...overlay, id } as Parameters<
                  typeof DrawerComponent
                >[0]["config"]
              }
            />
          );
        }

        return (
          <ModalComponent
            key={id}
            config={
              { ...overlay, id } as Parameters<
                typeof ModalComponent
              >[0]["config"]
            }
          />
        );
      })}
    </>
  );
}

function AppShell({
  manifest,
  route,
  currentPath,
  navigate,
  isPreloading,
  api,
}: {
  manifest: CompiledManifest;
  route: CompiledRoute;
  currentPath: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isPreloading: boolean;
  api: ReturnType<typeof createSnapshot>["api"];
}) {
  const shell = route.page.layout ?? manifest.app.shell ?? "full-width";
  const navConfig = manifest.navigation
    ? ({
        type: "nav",
        items: manifest.navigation.items,
        collapsible: true,
        userMenu: true,
      } as const)
    : null;

  const page = (
    <main
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "auto",
      }}
    >
      {isPreloading ? (
        <div data-snapshot-route-loading="" style={{ padding: "1rem" }}>
          <AppFallback manifest={manifest} name="loading" api={api} />
        </div>
      ) : (
        <PageRenderer
          page={route.page}
          routeId={currentPath}
          state={manifest.state}
          resources={manifest.resources}
          api={api}
        />
      )}
    </main>
  );

  if (!navConfig || shell === "minimal" || shell === "full-width") {
    return page;
  }

  if (shell === "top-nav") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
          }}
        >
          <Nav
            config={navConfig}
            pathname={currentPath}
            onNavigate={(path) => navigate(path)}
          />
        </div>
        {page}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          width: "280px",
          borderRight: "1px solid var(--sn-color-border, #e5e7eb)",
          flexShrink: 0,
        }}
      >
        <Nav
          config={navConfig}
          pathname={currentPath}
          onNavigate={(path) => navigate(path)}
        />
      </aside>
      {page}
    </div>
  );
}

interface ManifestRouterProps {
  manifest: CompiledManifest;
  api: ReturnType<typeof createSnapshot>["api"];
  snapshot: ReturnType<typeof createSnapshot>;
  authRuntimeConfig: ReturnType<typeof createManifestAuthRuntimeConfig>;
}

function ManifestRouter({
  manifest,
  api,
  snapshot,
  authRuntimeConfig,
}: ManifestRouterProps) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  });
  const [isPreloading, setIsPreloading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine === false : false,
  );
  const execute = useActionExecutor();
  const resourceCache = useManifestResourceCache();
  const previousMatchRef = useRef<{
    route: CompiledRoute | null;
    currentPath: string;
    params: Record<string, string>;
  } | null>(null);
  const authState = useSubscribe({ from: "global.auth" }) as {
    user?: Record<string, unknown> | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  } | null;
  const rawUser = useSubscribe({ from: "global.user" }) as Record<
    string,
    unknown
  > | null;
  const user =
    (authState?.user as Record<string, unknown> | null | undefined) ?? rawUser;
  const authLoading = manifest.auth
    ? Boolean(authState?.isLoading ?? true)
    : false;

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      const origin =
        window.location.origin && window.location.origin !== "null"
          ? window.location.origin
          : "http://localhost";
      const url = new URL(to, origin);
      const nextLocation = `${url.pathname}${url.search}${url.hash}`;
      if (options?.replace) {
        window.history.replaceState({}, "", nextLocation);
      } else {
        window.history.pushState({}, "", nextLocation);
      }
      setCurrentPath(url.pathname);
      dispatchPopState();
    },
    [],
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateOfflineState = () => {
      setIsOffline(window.navigator.onLine === false);
    };

    window.addEventListener("online", updateOfflineState);
    window.addEventListener("offline", updateOfflineState);
    updateOfflineState();

    return () => {
      window.removeEventListener("online", updateOfflineState);
      window.removeEventListener("offline", updateOfflineState);
    };
  }, []);

  const { route, params } = useMemo(
    () => resolveRouteMatch(manifest, currentPath),
    [currentPath, manifest],
  );
  const authScreen = useMemo(
    () => resolveAuthScreen(manifest, route),
    [manifest, route],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const nextTitle = resolveDocumentTitle(
      manifest,
      route,
      currentPath,
      params,
    );
    if (nextTitle) {
      document.title = nextTitle;
    }
  }, [currentPath, manifest, params, route]);

  useEffect(() => {
    setRuntimeError(null);
  }, [currentPath, route?.id]);

  const resolvedGuard = useResolveFrom({
    condition: route?.guard?.condition ?? null,
  }).condition;
  const routeAllowed = evaluateRouteGuard(route, user, resolvedGuard);

  useEffect(() => {
    if (!route || routeAllowed) {
      return;
    }

    if (route.guard?.authenticated && authLoading) {
      return;
    }

    const baseFallback =
      route.guard?.redirectTo ??
      (route.guard?.authenticated
        ? getAuthScreenPath(manifest, "login")
        : undefined) ??
      manifest.app.home ??
      manifest.firstRoute?.path ??
      "/";
    const fallback =
      route.guard?.authenticated && !route.guard?.redirectTo
        ? withRedirectParam(
            baseFallback,
            `${window.location.pathname}${window.location.search}`,
          )
        : baseFallback;
    if (fallback !== currentPath) {
      navigate(fallback, { replace: true });
    }
  }, [
    authLoading,
    currentPath,
    manifest,
    manifest.app.home,
    manifest.firstRoute?.path,
    navigate,
    route,
    routeAllowed,
  ]);

  useEffect(() => {
    if (!route || !routeAllowed) {
      return;
    }

    let cancelled = false;

    const runLifecycle = async () => {
      const previousMatch = previousMatchRef.current;
      if (
        previousMatch &&
        (previousMatch.currentPath !== currentPath ||
          previousMatch.route?.id !== route.id)
      ) {
        applyRouteResourceInvalidations(
          resourceCache,
          previousMatch.route?.invalidateOnLeave,
        );

        if (previousMatch.route?.leave) {
          if (typeof previousMatch.route.leave === "string") {
            await execute(
              { type: "run-workflow", workflow: previousMatch.route.leave },
              {
                route: {
                  id: previousMatch.route.id,
                  path: previousMatch.currentPath,
                  pattern: previousMatch.route.path,
                  params: previousMatch.params,
                },
                params: previousMatch.params,
              },
            );
          } else {
            await execute(previousMatch.route.leave as never, {
              route: {
                id: previousMatch.route.id,
                path: previousMatch.currentPath,
                pattern: previousMatch.route.path,
                params: previousMatch.params,
              },
              params: previousMatch.params,
            });
          }
        }
      }

      previousMatchRef.current = {
        route,
        currentPath,
        params,
      };

      applyRouteResourceInvalidations(resourceCache, route.refreshOnEnter);

      if (route.preload && route.preload.length > 0) {
        setIsPreloading(true);
        try {
          await Promise.all(
            route.preload.map((preloadTarget) => {
              if (!resourceCache) {
                return Promise.resolve();
              }

              const resolvedTarget = resolveRoutePreloadTarget(
                preloadTarget,
                params,
              );
              return resourceCache.loadTarget(
                resolvedTarget.target,
                resolvedTarget.params,
              );
            }),
          );
        } finally {
          if (!cancelled) {
            setIsPreloading(false);
          }
        }
      } else {
        setIsPreloading(false);
      }

      if (route.enter) {
        if (typeof route.enter === "string") {
          await execute(
            { type: "run-workflow", workflow: route.enter },
            {
              route: {
                id: route.id,
                path: currentPath,
                pattern: route.path,
                params,
              },
              params,
            },
          );
        } else {
          await execute(route.enter as never, {
            route: {
              id: route.id,
              path: currentPath,
              pattern: route.path,
              params,
            },
            params,
          });
        }
      }
    };

    void runLifecycle().catch((error: unknown) => {
      if (cancelled) {
        return;
      }

      setRuntimeError(
        error instanceof Error ? error : new Error("Manifest route failed"),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [currentPath, execute, params, resourceCache, route, routeAllowed]);

  if (!route) {
    return <AppFallback manifest={manifest} name="notFound" api={api} />;
  }

  if (runtimeError) {
    return <AppFallback manifest={manifest} name="error" api={api} />;
  }

  if (isOffline) {
    return <AppFallback manifest={manifest} name="offline" api={api} />;
  }

  if (route.guard?.authenticated && authLoading) {
    return (
      <div data-snapshot-auth-loading="" style={{ padding: "1rem" }}>
        <AppFallback manifest={manifest} name="loading" api={api} />
      </div>
    );
  }

  if (!routeAllowed) {
    return null;
  }

  return (
    <RouteRuntimeProvider
      value={{
        currentPath,
        currentRoute: route,
        params,
        navigate,
        isPreloading,
      }}
    >
      <ManifestErrorBoundary
        key={`${currentPath}:${route.id}`}
        fallback={<AppFallback manifest={manifest} name="error" api={api} />}
        onError={setRuntimeError}
      >
        {authScreen ? (
          <ManifestAuthScreen
            manifest={manifest}
            route={route}
            screen={authScreen}
            snapshot={snapshot}
            runtimeConfig={authRuntimeConfig}
            navigate={(to, options) => navigate(to, options)}
          />
        ) : (
          <AppShell
            manifest={manifest}
            route={route}
            currentPath={currentPath}
            navigate={navigate}
            isPreloading={isPreloading}
            api={api}
          />
        )}
      </ManifestErrorBoundary>
    </RouteRuntimeProvider>
  );
}

/**
 * Render the manifest-driven application shell.
 *
 * @param props - Manifest runtime props
 * @returns A fully rendered manifest application
 */
export function ManifestApp({
  manifest,
  apiUrl,
}: ManifestAppProps) {
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  const runtimeApiUrl = compiledManifest.app.apiUrl ?? apiUrl;
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl: runtimeApiUrl,
        manifest: compiledManifest.raw,
      }),
    [compiledManifest.raw, runtimeApiUrl],
  );
  const authRuntimeConfig = useMemo(
    () => createManifestAuthRuntimeConfig(runtimeApiUrl, compiledManifest),
    [compiledManifest, runtimeApiUrl],
  );

  useEffect(() => {
    if (compiledManifest.theme) {
      const css = resolveTokens(compiledManifest.theme);
      injectStyleSheet("snapshot-tokens", css);
    }
  }, [compiledManifest.theme]);

  return (
    <snapshot.QueryProvider>
      <SnapshotApiContext.Provider value={snapshot.api}>
        <ManifestRuntimeProvider manifest={compiledManifest} api={snapshot.api}>
          <AppContextProvider
            globals={compiledManifest.state}
            resources={compiledManifest.resources}
            api={snapshot.api}
          >
            {compiledManifest.auth || compiledManifest.realtime ? (
              <>
                <AuthRuntimeBridge
                  manifest={compiledManifest}
                  useUser={snapshot.useUser}
                />
                <ManifestAuthWorkflowBridge manifest={compiledManifest} />
                <ManifestRealtimeWorkflowBridge manifest={compiledManifest} />
              </>
            ) : null}
            <ManifestRouter
              manifest={compiledManifest}
              api={snapshot.api}
              snapshot={snapshot}
              authRuntimeConfig={authRuntimeConfig}
            />
            <OverlayHost overlays={compiledManifest.overlays} />
          </AppContextProvider>
        </ManifestRuntimeProvider>
      </SnapshotApiContext.Provider>
    </snapshot.QueryProvider>
  );
}
