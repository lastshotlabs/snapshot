/**
 * ManifestApp — renders an entire application from a manifest config.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { compileManifest } from "./compiler";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
  useManifestResourceCache,
} from "./runtime";
import { resolveDocumentTitle, resolveRouteMatch } from "./router";
import { PageRenderer } from "./renderer";
import type {
  CompiledManifest,
  CompiledRoute,
  ManifestAppProps,
  OverlayConfig,
} from "./types";

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

function inferAuthScreenPath(
  manifest: CompiledManifest,
  screen:
    | "login"
    | "register"
    | "forgot-password"
    | "reset-password"
    | "verify-email"
    | "mfa",
): string | undefined {
  const routeById = manifest.routes.find((route) => route.id === screen);
  if (routeById) {
    return routeById.path;
  }

  const candidates: Record<typeof screen, string[]> = {
    login: ["/login", "/auth/login"],
    register: ["/register", "/auth/register"],
    "forgot-password": ["/forgot-password", "/auth/forgot-password"],
    "reset-password": ["/reset-password", "/auth/reset-password"],
    "verify-email": ["/verify-email", "/auth/verify-email"],
    mfa: ["/mfa", "/auth/mfa"],
  };

  return candidates[screen].find((path) => manifest.routeMap[path] != null);
}

function withRedirectParam(path: string, redirectTo: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  const url = new URL(path, window.location.origin);
  url.searchParams.set("redirect", redirectTo);
  return `${url.pathname}${url.search}`;
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
  const shell =
    route.page.layout ??
    manifest.app.shell ??
    (manifest.navigation?.mode === "top-nav" ? "top-nav" : "full-width");
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
          Loading...
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
      const url = new URL(to, window.location.origin);
      const nextLocation = `${url.pathname}${url.search}${url.hash}`;
      if (options?.replace) {
        window.history.replaceState({}, "", nextLocation);
      } else {
        window.history.pushState({}, "", nextLocation);
      }
      setCurrentPath(url.pathname);
      window.dispatchEvent(new PopStateEvent("popstate"));
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
        ? inferAuthScreenPath(manifest, "login")
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
          previousMatch.route?.id !== route.id) &&
        previousMatch.route?.leave
      ) {
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

      previousMatchRef.current = {
        route,
        currentPath,
        params,
      };

      if (route.preload && route.preload.length > 0) {
        setIsPreloading(true);
        try {
          await Promise.all(
            route.preload.map((target) =>
              resourceCache
                ? resourceCache.loadTarget(
                    typeof target === "string"
                      ? target
                      : {
                          ...target,
                          params: {
                            ...params,
                            ...(target.params ?? {}),
                          },
                        },
                    typeof target === "string" ? params : undefined,
                  )
                : Promise.resolve(),
            ),
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

    void runLifecycle();

    return () => {
      cancelled = true;
    };
  }, [currentPath, execute, params, resourceCache, route, routeAllowed]);

  if (!route) {
    return null;
  }

  if (route.guard?.authenticated && authLoading) {
    return (
      <div data-snapshot-auth-loading="" style={{ padding: "1rem" }}>
        Loading...
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
    </RouteRuntimeProvider>
  );
}

export function ManifestApp({
  manifest,
  apiUrl,
  snapshotConfig,
}: ManifestAppProps) {
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl,
        ...snapshotConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiUrl],
  );
  const authRuntimeConfig = useMemo(
    () => createManifestAuthRuntimeConfig(apiUrl, snapshotConfig),
    [apiUrl, snapshotConfig],
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
            {compiledManifest.auth ? (
              <AuthRuntimeBridge
                manifest={compiledManifest}
                useUser={snapshot.useUser}
              />
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
