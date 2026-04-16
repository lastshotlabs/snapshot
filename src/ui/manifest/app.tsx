/**
 * ManifestApp — renders an entire application from a manifest config.
 */

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ZodError } from "zod";
import {
  ApiClient,
  getRegisteredClient,
  type ApiClientLike,
} from "../../api/client";
import { mergeContract } from "../../auth/contract";
import { createSnapshot } from "../../create-snapshot";
import { useActionExecutor } from "../actions/executor";
import { ToastContainer } from "../actions/toast";
import {
  AppContextProvider,
  useResolveFrom,
  useSubscribe,
} from "../context/index";
import { SkipLinks } from "../components/_base/skip-links";
import { Layout } from "../components/layout/layout";
import { Nav } from "../components/layout/nav";
import type { NavConfig as ShellNavConfig } from "../components/layout/nav";
import { DrawerComponent } from "../components/overlay/drawer";
import { ModalComponent } from "../components/overlay/modal";
import { ConfirmDialogComponent } from "../components/overlay/confirm-dialog";
import { SnapshotDragDropProvider } from "../components/_base/drag-drop-provider";
import { useSetStateValue, useStateValue } from "../state";
import { resolveDetectedLocale, resolveI18nRefs } from "../i18n/resolve";
import type { PolicyExpr } from "../policies/types";
import { evaluatePolicy } from "../policies/evaluate";
import { resolveTokens, resolveFrameworkStyles } from "../tokens/resolve";
import { validateContrast } from "../tokens/contrast-checker";
import { registerShortcuts } from "../shortcuts/index";
import { getAuthScreenPath } from "./auth-routes";
import { registerBuiltInComponents } from "../components/register";
import { compileManifest } from "./compiler";
import { useEventBridge, useSseEventBridge } from "./event-bridge";
import { TransitionWrapper } from "./transition-wrapper";
import { ManifestErrorOverlay } from "./error-overlay";
import { ComponentInspector } from "./inspector";
import {
  evaluateManifestGuard,
  guardUsesAuthState,
} from "./guard-registry";
import {
  collectComponentTypes,
  ensureComponentsLoaded,
  resetLazyRegistry,
} from "./lazy-registry";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
  useManifestResourceCache,
} from "./runtime";
import { normalizePathname, resolveRouteMatch } from "./router";
import { ComponentRenderer, PageRenderer } from "./renderer";
import type { EndpointTarget } from "./resources";
import { useRoutePrefetch } from "./use-route-prefetch";
import type {
  ComponentConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestAppProps,
  OverlayConfig,
} from "./types";
import type { ShortcutBinding } from "../shortcuts/types";
import { bootBuiltins } from "./boot-builtins";
import { resetRegisteredComponents } from "./component-registry";
import { resolveTemplate } from "../expressions/template";

const EMPTY_OBJECT: Record<string, unknown> = {};
const ROUTE_ENTER_REPLAY_WINDOW_MS = 1_500;
const recentRouteEnterExecutions = new Map<string, number>();

function shouldSkipImmediateRouteEnterReplay(key: string): boolean {
  const now = Date.now();
  for (const [entryKey, timestamp] of recentRouteEnterExecutions.entries()) {
    if (now - timestamp > ROUTE_ENTER_REPLAY_WINDOW_MS) {
      recentRouteEnterExecutions.delete(entryKey);
    }
  }

  const previousExecution = recentRouteEnterExecutions.get(key);
  recentRouteEnterExecutions.set(key, now);
  return (
    typeof previousExecution === "number" &&
    now - previousExecution < ROUTE_ENTER_REPLAY_WINDOW_MS
  );
}

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

function getBrowserLocation(): { pathname: string; search: string } {
  if (typeof window === "undefined") {
    return { pathname: "/", search: "" };
  }

  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

interface SubAppInheritConfig {
  theme: boolean;
  i18n: boolean;
  policies: boolean;
  state: boolean;
}

interface ResolvedSubAppMatch {
  subManifest: CompiledManifest;
  mountPath: string;
  inherit: SubAppInheritConfig;
}

interface RuntimeSubAppConfig {
  mountPath: string;
  manifest: string | Record<string, unknown>;
  inherit?: Partial<SubAppInheritConfig>;
}

interface RuntimeClientConfig {
  apiUrl: string | { default?: string };
  contract?: unknown;
  custom?: string;
}

type NavUserMenuConfig = Exclude<NonNullable<ShellNavConfig["userMenu"]>, boolean>;
type NavUserMenuItem = NonNullable<NavUserMenuConfig["items"]>[number];

function normalizeSubAppInherit(
  inherit?: Partial<SubAppInheritConfig>,
): SubAppInheritConfig {
  return {
    theme: inherit?.theme ?? true,
    i18n: inherit?.i18n ?? true,
    policies: inherit?.policies ?? true,
    state: inherit?.state ?? false,
  };
}

function joinPathPrefix(prefix: string | undefined, path: string): string {
  const normalizedPath = normalizePathname(path);
  if (!prefix || prefix === "/") {
    return normalizedPath;
  }

  const normalizedPrefix = normalizePathname(prefix);
  if (normalizedPath === "/") {
    return normalizedPrefix;
  }

  return normalizePathname(`${normalizedPrefix}${normalizedPath}`);
}

function matchesMountPath(currentPath: string, mountPath: string): boolean {
  const normalizedCurrentPath = normalizePathname(currentPath);
  const normalizedMountPath = normalizePathname(mountPath);
  if (normalizedMountPath === "/") {
    return true;
  }

  return (
    normalizedCurrentPath === normalizedMountPath ||
    normalizedCurrentPath.startsWith(`${normalizedMountPath}/`)
  );
}

function stripMountPath(currentPath: string, mountPath: string): string {
  const normalizedCurrentPath = normalizePathname(currentPath);
  const normalizedMountPath = normalizePathname(mountPath);

  if (normalizedMountPath === "/") {
    return normalizedCurrentPath;
  }

  if (normalizedCurrentPath === normalizedMountPath) {
    return "/";
  }

  if (!normalizedCurrentPath.startsWith(`${normalizedMountPath}/`)) {
    return normalizedCurrentPath;
  }

  const stripped = normalizedCurrentPath.slice(normalizedMountPath.length);
  return normalizePathname(stripped || "/");
}

function resolveSubAppMatch(
  manifest: CompiledManifest,
  currentPath: string,
  prefix?: string,
): ResolvedSubAppMatch | null {
  const subApps = manifest.raw.subApps as Record<string, RuntimeSubAppConfig> | undefined;
  if (!subApps) {
    return null;
  }

  let bestMatch: ResolvedSubAppMatch | null = null;
  for (const subAppConfig of Object.values(subApps)) {
    if (typeof subAppConfig.manifest === "string") {
      continue;
    }

    const absoluteMountPath = joinPathPrefix(prefix, subAppConfig.mountPath);
    if (!matchesMountPath(currentPath, absoluteMountPath)) {
      continue;
    }

    const compiledSubManifest = compileManifest(subAppConfig.manifest);
    const inherit = normalizeSubAppInherit(subAppConfig.inherit);
    const nestedCurrentPath = stripMountPath(currentPath, absoluteMountPath);
    const nestedMatch = resolveSubAppMatch(
      compiledSubManifest,
      nestedCurrentPath,
      absoluteMountPath,
    );
    const candidate = nestedMatch ?? {
      subManifest: compiledSubManifest,
      mountPath: absoluteMountPath,
      inherit,
    };

    if (!bestMatch || candidate.mountPath.length > bestMatch.mountPath.length) {
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

function buildManifestClientMap(
  manifest: CompiledManifest,
  snapshot: ReturnType<typeof createSnapshot>,
): Record<string, ApiClientLike> {
  const clients: Record<string, ApiClientLike> = {
    main: snapshot.api,
  };
  const authMode = manifest.auth?.session?.mode ?? "cookie";
  const declaredClients = manifest.raw.clients as
    | Record<string, RuntimeClientConfig>
    | undefined;

  for (const [name, config] of Object.entries(declaredClients ?? {})) {
    const apiUrl =
      typeof config.apiUrl === "string" ? config.apiUrl : config.apiUrl.default;
    if (!apiUrl) {
      throw new Error(
        `Manifest client "${name}" has an unresolved apiUrl. Use a literal string or provide a default for its env ref.`,
      );
    }

    if (config.custom) {
      const factory = getRegisteredClient(config.custom);
      if (!factory) {
        throw new Error(
          `Manifest client "${name}" references unregistered custom client "${config.custom}". Register it with registerClient("${config.custom}", factory).`,
        );
      }
      clients[name] = factory(apiUrl, snapshot.bootstrap);
      continue;
    }

    const contractOverride =
      config.contract && typeof config.contract === "object"
        ? (config.contract as Parameters<typeof mergeContract>[1])
        : undefined;
    const client = new ApiClient({
      apiUrl,
      auth: authMode,
      contract: mergeContract(apiUrl, contractOverride),
    });
    client.setStorage(snapshot.tokenStorage);
    clients[name] = client;
  }

  return clients;
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

interface RouteLayoutSlotDeclaration {
  name: string;
  required?: boolean;
  fallback?: ComponentConfig;
}

type RouteLayoutDeclaration =
  | string
  | {
      type: string;
      props?: Record<string, unknown>;
      slots?: RouteLayoutSlotDeclaration[];
    };

type RouteSlotsDeclaration = Record<string, ComponentConfig[]>;

const SLOT_ENABLED_LAYOUT_TYPES = new Set(["sidebar", "top-nav", "stacked"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRawRouteRecord(
  manifest: CompiledManifest,
  routeId: string,
): Record<string, unknown> | undefined {
  const rawRoutes = isRecord(manifest.raw)
    ? ((manifest.raw as Record<string, unknown>)["routes"] as unknown)
    : undefined;
  if (!Array.isArray(rawRoutes)) {
    return undefined;
  }

  const visit = (routes: unknown[]): Record<string, unknown> | undefined => {
    for (const route of routes) {
      if (!isRecord(route)) {
        continue;
      }

      if (route["id"] === routeId) {
        return route;
      }

      if (Array.isArray(route["children"])) {
        const nested = visit(route["children"] as unknown[]);
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  };

  return visit(rawRoutes);
}

function readRouteLayouts(
  manifest: CompiledManifest,
  routeId: string,
): RouteLayoutDeclaration[] {
  const route = getRawRouteRecord(manifest, routeId);
  const layouts = route?.["layouts"];
  if (!Array.isArray(layouts) || layouts.length === 0) {
    // navigation.mode takes precedence over app.shell so the nav config and
    // layout variant stay in sync when only navigation.mode is set.
    return [manifest.navigation?.mode ?? manifest.app.shell ?? "full-width"];
  }

  return layouts.filter(
    (layout): layout is RouteLayoutDeclaration =>
      typeof layout === "string" || isRecord(layout),
  );
}

function readRouteSlots(
  manifest: CompiledManifest,
  routeId: string,
): RouteSlotsDeclaration {
  const route = getRawRouteRecord(manifest, routeId);
  const slots = route?.["slots"];
  if (!isRecord(slots)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(slots).map(([slotName, value]) => {
      if (!Array.isArray(value)) {
        return [slotName, []];
      }

      return [
        slotName,
        value.filter(
          (item): item is ComponentConfig => isRecord(item) && "type" in item,
        ),
      ];
    }),
  );
}

function getLayoutType(layout: RouteLayoutDeclaration): string {
  if (typeof layout === "string") {
    return layout;
  }

  return layout.type;
}

function getLayoutProps(
  layout: RouteLayoutDeclaration,
): Record<string, unknown> {
  if (typeof layout === "string") {
    return {};
  }

  return layout.props ?? {};
}

function getLayoutSlots(
  layout: RouteLayoutDeclaration,
): RouteLayoutSlotDeclaration[] {
  if (typeof layout === "string") {
    return [];
  }

  return Array.isArray(layout.slots) ? layout.slots : [];
}

function getBuiltInLayoutSlots(type: string): RouteLayoutSlotDeclaration[] {
  if (!SLOT_ENABLED_LAYOUT_TYPES.has(type)) {
    return [];
  }

  return [
    { name: "nav" },
    { name: "header" },
    { name: "sidebar" },
    { name: "main", required: true },
    { name: "footer" },
  ];
}

function layoutSupportsSlots(layout: RouteLayoutDeclaration): boolean {
  return (
    SLOT_ENABLED_LAYOUT_TYPES.has(getLayoutType(layout)) ||
    getLayoutSlots(layout).length > 0
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

function setClientDefaultHeadersProvider(
  client: ApiClientLike | null | undefined,
  provider?: () => Record<string, string> | undefined,
): void {
  if (
    client &&
    typeof (client as { setDefaultHeadersProvider?: unknown })
      .setDefaultHeadersProvider === "function"
  ) {
    (client as ApiClient & {
      setDefaultHeadersProvider: (
        provider?: () => Record<string, string> | undefined,
      ) => void;
    }).setDefaultHeadersProvider(provider);
  }
}

function ManifestApiHeadersBridge({
  manifest,
  api,
  clients,
}: {
  manifest: CompiledManifest;
  api: ReturnType<typeof createSnapshot>["api"];
  clients: Record<string, ApiClientLike>;
}) {
  const resolvedHeaders = useResolveFrom(
    (manifest.app.headers ?? EMPTY_OBJECT) as Record<string, unknown>,
  ) as Record<string, unknown>;

  const headerValues = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolvedHeaders)) {
      if (value == null) {
        continue;
      }
      next[key] = String(value);
    }
    return next;
  }, [resolvedHeaders]);

  useLayoutEffect(() => {
    const provider = () => headerValues;
    setClientDefaultHeadersProvider(api, provider);
    for (const client of Object.values(clients)) {
      setClientDefaultHeadersProvider(client, provider);
    }

    return () => {
      setClientDefaultHeadersProvider(api, undefined);
      for (const client of Object.values(clients)) {
        setClientDefaultHeadersProvider(client, undefined);
      }
    };
  }, [api, clients, headerValues]);

  return null;
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
const MANIFEST_REALTIME_WORKFLOW_EVENT = "snapshot:manifest-realtime-workflow";
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
      manifest.realtime?.ws?.on as
        | Record<string, string | undefined>
        | undefined
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
      const detail = (event as CustomEvent<ManifestRealtimeWorkflowDetail>)
        .detail;
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

        if (overlay.type === "confirm-dialog") {
          return (
            <ConfirmDialogComponent
              key={id}
              config={
                { ...overlay, id } as Parameters<
                  typeof ConfirmDialogComponent
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
  parents,
  currentPath,
  navigate,
  isPreloading,
  api,
}: {
  manifest: CompiledManifest;
  route: CompiledRoute;
  parents: CompiledRoute[];
  currentPath: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isPreloading: boolean;
  api: ReturnType<typeof createSnapshot>["api"];
}) {
  const fallbackLogoText =
    (typeof manifest.app.title === "string" ? manifest.app.title.trim() : "") ||
    (typeof manifest.raw.app?.title === "string"
      ? manifest.raw.app.title.trim()
      : "") ||
    "Snapshot";
  const navUserMenu: ShellNavConfig["userMenu"] =
    manifest.navigation?.userMenu === undefined
      ? true
      : manifest.navigation.userMenu === true || manifest.navigation.userMenu === false
        ? manifest.navigation.userMenu
        : {
            showAvatar: manifest.navigation.userMenu.showAvatar,
            showEmail: manifest.navigation.userMenu.showEmail,
            items: manifest.navigation.userMenu.items?.map((item: NavUserMenuItem) => ({
              label: item.label,
              icon: item.icon,
              action: item.action,
              roles: item.roles,
              slots: item.slots,
            })),
          };
  const navLogo: ShellNavConfig["logo"] =
    manifest.navigation?.logo ?? {
      text: fallbackLogoText,
      path: manifest.app.home ?? manifest.firstRoute?.path ?? "/",
    };
  const navConfig: ShellNavConfig | null = manifest.navigation
    ? {
        type: "nav",
        items: manifest.navigation.items,
        template: manifest.navigation.template,
        collapsible: manifest.navigation.collapsible ?? true,
        userMenu: navUserMenu,
        logo: navLogo,
        className: manifest.navigation.className,
        style: manifest.navigation.style,
        slots: manifest.navigation.slots,
      }
    : null;

  const loadingFallback = (
    <AppFallback manifest={manifest} name="loading" api={api} />
  );

  // Leaf page content
  const page = (
    <TransitionWrapper
      config={route.transition}
      routeKey={`${route.id}:${currentPath}`}
    >
      {isPreloading ? (
        <div data-snapshot-route-loading="" style={{ padding: "1rem" }}>
          {loadingFallback}
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
    </TransitionWrapper>
  );

  // ── Build layout layers: global shell + route explicit layouts ──────────
  interface LayoutLayer {
    layout: RouteLayoutDeclaration;
    routeSlots: RouteSlotsDeclaration;
  }

  const layers: LayoutLayer[] = [];

  // Check if any route in the chain suppresses the global shell
  const routeChain = [...parents, route];
  const shellSuppressed = routeChain.some((chainRoute) => {
    const rawRoute = getRawRouteRecord(manifest, chainRoute.id);
    return rawRoute?.["shell"] === false;
  });

  // Layer 0: global outer shell (navigation.mode > app.shell > full-width)
  // Skipped when the leaf route (or any ancestor) sets shell: false
  if (!shellSuppressed) {
    const globalLayoutType =
      manifest.navigation?.mode ?? manifest.app.shell ?? "full-width";
    layers.push({ layout: globalLayoutType, routeSlots: {} });
  }
  for (const chainRoute of routeChain) {
    const rawRoute = getRawRouteRecord(manifest, chainRoute.id);
    const rawLayouts = rawRoute?.["layouts"];
    if (Array.isArray(rawLayouts) && rawLayouts.length > 0) {
      const routeLayouts = rawLayouts.filter(
        (l): l is RouteLayoutDeclaration =>
          typeof l === "string" || isRecord(l),
      );
      if (routeLayouts.length > 0) {
        const chainRouteSlots = readRouteSlots(manifest, chainRoute.id);
        for (const rl of routeLayouts) {
          layers.push({ layout: rl, routeSlots: chainRouteSlots });
        }
      }
    }
  }

  // Determine which layer gets the auto-generated nav (outermost that supports it)
  const navLayerIndex = layers.findIndex((layer) => {
    const lt = getLayoutType(layer.layout);
    return lt === "sidebar" || lt === "top-nav";
  });

  // Check if any route in the chain overrides the nav slot (leaf priority)
  let navSlotOverrideConfigs: ComponentConfig[] | undefined;
  for (let i = routeChain.length - 1; i >= 0; i--) {
    const rs = readRouteSlots(manifest, routeChain[i]!.id);
    if (rs["nav"] && rs["nav"].length > 0) {
      navSlotOverrideConfigs = rs["nav"];
      break;
    }
  }

  // ── Compose from innermost to outermost ─────────────────────────────────
  return layers.reduceRight<ReactNode>(
    (children, layer, index) => {
      const layoutType = getLayoutType(layer.layout);

      // Build declared slots for this layout type
      const declaredSlots = new Map<string, RouteLayoutSlotDeclaration>();
      for (const slot of getBuiltInLayoutSlots(layoutType)) {
        declaredSlots.set(slot.name, slot);
      }
      for (const slot of getLayoutSlots(layer.layout)) {
        declaredSlots.set(slot.name, slot);
      }

      // Build slot content (excluding "nav" — handled via nav prop)
      const slotContent = layoutSupportsSlots(layer.layout)
        ? (Object.fromEntries(
            [...declaredSlots.entries()]
              .filter(([slotName]) => slotName !== "nav")
              .map(([slotName, declaration]) => {
                const routeSlotConfigs =
                  layer.routeSlots[slotName] ?? [];
                const hasRouteContent = routeSlotConfigs.length > 0;

                const content = hasRouteContent ? (
                  <>
                    {routeSlotConfigs.map((slotConfig, si) => (
                      <ComponentRenderer
                        key={`slot:${slotName}:${si}`}
                        config={slotConfig}
                      />
                    ))}
                  </>
                ) : declaration?.fallback ? (
                  <ComponentRenderer config={declaration.fallback} />
                ) : slotName === "main" ? (
                  children
                ) : null;

                if (!content) {
                  if (declaration?.required) {
                    throw new Error(
                      `Layout "${layoutType}" requires slot "${slotName}" but no content was provided.`,
                    );
                  }
                  return [slotName, null];
                }

                const suspenseFallback = declaration?.fallback ? (
                  <ComponentRenderer config={declaration.fallback} />
                ) : (
                  loadingFallback
                );

                return [
                  slotName,
                  <Suspense
                    key={`slot-boundary:${layoutType}:${slotName}`}
                    fallback={suspenseFallback}
                  >
                    {content}
                  </Suspense>,
                ];
              }),
          ) as Record<string, ReactNode>)
        : undefined;

      // Nav: slot override > auto-generated > none
      const isNavLayer = index === navLayerIndex;
      let navNode: ReactNode = undefined;
      if (isNavLayer && navSlotOverrideConfigs) {
        navNode = (
          <>
            {navSlotOverrideConfigs.map((cfg, ni) => (
              <ComponentRenderer key={`slot:nav:${ni}`} config={cfg} />
            ))}
          </>
        );
      } else if (
        isNavLayer &&
        navConfig &&
        (layoutType === "sidebar" || layoutType === "top-nav")
      ) {
        navNode = (
          <Nav
            config={navConfig}
            pathname={currentPath}
            onNavigate={(path) => navigate(path)}
            variant={layoutType as "sidebar" | "top-nav"}
          />
        );
      }

      return (
        <Layout
          key={`layout:${layoutType}:${index}`}
          config={
            {
              type: "layout",
              variant: layoutType,
              ...getLayoutProps(layer.layout),
            } as Parameters<typeof Layout>[0]["config"]
          }
          nav={navNode}
          slots={slotContent}
        >
          {children}
        </Layout>
      );
    },
    page,
  );
}

interface ManifestRouterProps {
  manifest: CompiledManifest;
  api: ReturnType<typeof createSnapshot>["api"];
  snapshot: ReturnType<typeof createSnapshot>;
  runtimeClients: Record<string, ApiClientLike>;
  lazyComponents?: boolean;
  basePath?: string;
  parentTheme?: CompiledManifest["theme"];
  parentPolicies?: Record<string, PolicyExpr>;
}

function ManifestRouter({
  manifest,
  api,
  snapshot,
  runtimeClients,
  lazyComponents,
  basePath,
  parentTheme,
  parentPolicies,
}: ManifestRouterProps) {
  const [currentLocation, setCurrentLocation] = useState(getBrowserLocation);
  const [isPreloading, setIsPreloading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);
  const [lazyRouteKey, setLazyRouteKey] = useState("");
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine === false : false,
  );
  const execute = useActionExecutor();
  const executeRef = useRef(execute);
  executeRef.current = execute;
  const wsManager = snapshot.useWebSocketManager();
  const resourceCache = useManifestResourceCache();
  const resourceCacheRef = useRef(resourceCache);
  resourceCacheRef.current = resourceCache;
  const previousMatchRef = useRef<{
    route: CompiledRoute | null;
    currentPath: string;
    params: Record<string, string>;
    query: Record<string, string>;
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
  const localeStateValue = useStateValue("locale", { scope: "auto" });
  const setLocaleState = useSetStateValue("locale", { scope: "auto" });
  const [navigatorLocale, setNavigatorLocale] = useState<string | undefined>(
    undefined,
  );

  const policyDefinitions = (manifest.raw.policies ?? EMPTY_OBJECT) as Record<
    string,
    unknown
  >;
  const resolvedPolicies = useResolveFrom(policyDefinitions) as Record<
    string,
    unknown
  >;
  const policyMap = resolvedPolicies as Record<string, PolicyExpr>;
  const localeFromState =
    typeof localeStateValue === "string" ? localeStateValue : undefined;
  const activeLocale = useMemo(
    () =>
      resolveDetectedLocale(manifest.raw.i18n, {
        stateLocale: localeFromState,
        navigatorLanguage: navigatorLocale,
      }) ?? manifest.raw.i18n?.default,
    [localeFromState, manifest.raw.i18n, navigatorLocale],
  );
  const localizedManifest = useMemo(
    () =>
      resolveI18nRefs(manifest, {
        locale: activeLocale,
        i18n: manifest.raw.i18n,
      }),
    [activeLocale, manifest],
  );

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      const origin =
        window.location.origin && window.location.origin !== "null"
          ? window.location.origin
          : "http://localhost";
      const nextPath = joinPathPrefix(basePath, to);
      const url = new URL(nextPath, origin);
      const nextLocation = `${url.pathname}${url.search}${url.hash}`;
      if (options?.replace) {
        window.history.replaceState({}, "", nextLocation);
      } else {
        window.history.pushState({}, "", nextLocation);
      }
      setCurrentLocation({
        pathname: url.pathname,
        search: url.search,
      });
    },
    [basePath],
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentLocation(getBrowserLocation());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Register keyboard shortcuts from manifest
  useEffect(() => {
    const rawShortcuts = manifest.raw.shortcuts as
      | Record<string, ShortcutBinding>
      | undefined;
    if (!rawShortcuts || Object.keys(rawShortcuts).length === 0) return;

    const shortcuts = Object.fromEntries(
      Object.entries(rawShortcuts).filter((entry) => {
        const binding = entry[1];
        if (binding.disabled === true) {
          return false;
        }
        if (binding.disabled === false || binding.disabled === undefined) {
          return true;
        }
        return !evaluatePolicy(
          `shortcut:${entry[0]}`,
          binding.disabled,
          { policies: policyMap, parentPolicies },
        );
      }),
    );

    if (Object.keys(shortcuts).length === 0) {
      return;
    }

    return registerShortcuts(
      shortcuts,
      (action) => void execute(action),
    );
  }, [execute, manifest.raw.shortcuts, parentPolicies, policyMap]);

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

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    setNavigatorLocale(navigator.language);
  }, []);

  useEffect(() => {
    if (!manifest.raw.i18n?.detect?.includes("state") || !activeLocale) {
      return;
    }

    if (localeFromState !== activeLocale) {
      setLocaleState(activeLocale);
    }
  }, [
    activeLocale,
    localeFromState,
    manifest.raw.i18n?.detect,
    setLocaleState,
  ]);

  useEffect(() => {
    if (typeof document === "undefined" || !activeLocale) {
      return;
    }

    document.documentElement.dir = ["ar", "he", "fa", "ur"].includes(
      activeLocale.split("-")[0] ?? activeLocale,
    )
      ? "rtl"
      : "ltr";
  }, [activeLocale]);

  const scopedCurrentPath = useMemo(
    () => stripMountPath(currentLocation.pathname, basePath ?? "/"),
    [basePath, currentLocation.pathname],
  );
  const scopedCurrentLocation = useMemo(
    () => `${scopedCurrentPath}${currentLocation.search}`,
    [currentLocation.search, scopedCurrentPath],
  );
  const routeQuery = useMemo(() => {
    return Object.fromEntries(
      new URLSearchParams(currentLocation.search).entries(),
    );
  }, [currentLocation.search]);
  const subAppMatch = useMemo(
    () => resolveSubAppMatch(localizedManifest, currentLocation.pathname, basePath),
    [basePath, currentLocation.pathname, localizedManifest],
  );
  const match = useMemo(
    () =>
      subAppMatch
        ? {
            route: null,
            params: {} as Record<string, string>,
            parents: [] as CompiledRoute[],
            activeRoutes: [] as CompiledRoute[],
          }
        : resolveRouteMatch(localizedManifest, scopedCurrentPath),
    [localizedManifest, scopedCurrentPath, subAppMatch],
  );
  const route = match.route;
  const params = match.params;
  const lazyTypes = useMemo(
    () =>
      lazyComponents
        ? collectRouteRenderTypes(
            localizedManifest,
            match.activeRoutes.length > 0
              ? match.activeRoutes
              : route
                ? [route]
                : [],
          )
        : [],
    [lazyComponents, localizedManifest, match.activeRoutes, route],
  );
  const nextLazyRouteKey = useMemo(
    () => lazyTypes.slice().sort().join("|"),
    [lazyTypes],
  );
  useRoutePrefetch(route?.prefetch);
  useEventBridge(
    wsManager as ReturnType<typeof snapshot.useWebSocketManager>,
    localizedManifest.realtime?.ws?.eventActions as
      | Record<string, import("../actions/types").ActionConfig | import("../actions/types").ActionConfig[]>
      | undefined,
    execute,
  );
  useEventBridge(
    wsManager as ReturnType<typeof snapshot.useWebSocketManager>,
    route?.events as
      | Record<string, import("../actions/types").ActionConfig | import("../actions/types").ActionConfig[]>
      | undefined,
    execute,
  );
  useSseEventBridge(
    snapshot.onSseEvent,
    localizedManifest.realtime?.sse?.endpoints as
      | Record<string, { eventActions?: Record<string, import("../actions/types").ActionConfig | import("../actions/types").ActionConfig[]> }>
      | undefined,
    execute,
  );
  const subAppClients = useMemo(
    () =>
      subAppMatch
        ? {
            ...runtimeClients,
            ...buildManifestClientMap(subAppMatch.subManifest, snapshot),
          }
        : runtimeClients,
    [runtimeClients, snapshot, subAppMatch],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const templateContext = {
      app: localizedManifest.app ?? {},
      auth: localizedManifest.auth ?? {},
      route: route
        ? {
            id: route.id,
            path: scopedCurrentPath,
            pattern: route.path,
            params,
            query: routeQuery,
          }
        : undefined,
    };
    const templateOptions = {
      locale: activeLocale,
      i18n: localizedManifest.raw.i18n,
    };
    const appTitle =
      typeof localizedManifest.app.title === "string"
        ? resolveTemplate(
            localizedManifest.app.title,
            templateContext,
            templateOptions,
          ).trim()
        : "";
    const routeTitle =
      route && typeof route.page.title === "string"
        ? resolveTemplate(route.page.title, templateContext, templateOptions).trim()
        : "";
    const nextTitle =
      routeTitle && appTitle ? `${routeTitle} | ${appTitle}` : routeTitle || appTitle;
    if (nextTitle) {
      document.title = nextTitle;
    }
  }, [activeLocale, localizedManifest, params, route, routeQuery, scopedCurrentPath]);

  useEffect(() => {
    if (!lazyComponents) {
      setLazyRouteKey("");
      return;
    }

    if (lazyTypes.length === 0) {
      setLazyRouteKey(nextLazyRouteKey);
      return;
    }

    let cancelled = false;
    void ensureComponentsLoaded(lazyTypes)
      .then(() => {
        if (!cancelled) {
          setLazyRouteKey(nextLazyRouteKey);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRuntimeError(
            error instanceof Error
              ? error
              : new Error("Lazy component registration failed"),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lazyComponents, lazyTypes, nextLazyRouteKey]);

  useEffect(() => {
    setRuntimeError(null);
  }, [currentLocation.pathname, currentLocation.search, route?.id]);

  useEffect(() => {
    if (!subAppMatch?.subManifest.theme) {
      return;
    }

    injectStyleSheet(
      "snapshot-tokens",
      resolveTokens(subAppMatch.subManifest.theme),
    );
    return () => {
      const fallbackTheme = parentTheme ?? manifest.theme;
      if (fallbackTheme) {
        injectStyleSheet("snapshot-tokens", resolveTokens(fallbackTheme));
      }
    };
  }, [manifest.theme, parentTheme, subAppMatch]);

  const routeGuardResult =
    route
      ? evaluateManifestGuard(route.guard, {
          route,
          user,
          manifest: localizedManifest,
          policies: policyMap,
          parentPolicies,
          routeContext: {
            id: route.id,
            path: scopedCurrentPath,
            pattern: route.path,
            params,
            query: routeQuery,
          },
        })
      : { allow: true as const };
  const routeAllowed = routeGuardResult.allow;

  useEffect(() => {
    if (!route || routeAllowed || routeGuardResult.render) {
      return;
    }

    if (guardUsesAuthState(route.guard) && authLoading) {
      return;
    }

    const baseFallback =
      (routeGuardResult.redirect
        ? resolveTemplate(
            routeGuardResult.redirect,
            {
              app: localizedManifest.app ?? {},
              auth: localizedManifest.auth ?? {},
              route: {
                id: route.id,
                path: scopedCurrentPath,
                pattern: route.path,
                params,
                query: routeQuery,
              },
            },
            {
              locale: activeLocale,
              i18n: localizedManifest.raw.i18n,
            },
          )
        : undefined) ??
      ((typeof route.guard === "string"
        ? route.guard === "authenticated"
        : route.guard?.authenticated === true ||
          route.guard?.name === "authenticated")
        ? getAuthScreenPath(localizedManifest, "login")
        : undefined) ??
      localizedManifest.app.home ??
      localizedManifest.firstRoute?.path ??
      "/";
    const fallback =
      (typeof route.guard === "string"
        ? route.guard === "authenticated"
        : route.guard?.authenticated === true ||
          route.guard?.name === "authenticated") &&
      !routeGuardResult.redirect
        ? withRedirectParam(
            baseFallback,
            `${currentLocation.pathname}${currentLocation.search}`,
          )
        : baseFallback;
    if (fallback !== scopedCurrentLocation) {
      navigate(fallback, { replace: true });
    }
  }, [
    activeLocale,
    authLoading,
    currentLocation.pathname,
    currentLocation.search,
    localizedManifest,
    localizedManifest.app.home,
    localizedManifest.firstRoute?.path,
    navigate,
    params,
    route,
    routeAllowed,
    routeGuardResult.redirect,
    routeGuardResult.render,
    scopedCurrentPath,
    scopedCurrentLocation,
    routeQuery,
  ]);

  useEffect(() => {
    if (!route || !routeAllowed) {
      return;
    }

    let cancelled = false;
    const abortController = new AbortController();

    const runLifecycle = async () => {
      const currentExecute = executeRef.current;
      const currentResourceCache = resourceCacheRef.current;
      const previousMatch = previousMatchRef.current;
      const routeEnterReplayKey = `${route.id}:${scopedCurrentPath}${currentLocation.search}`;
      if (
        previousMatch &&
        (previousMatch.currentPath !== scopedCurrentPath ||
          previousMatch.route?.id !== route.id)
      ) {
        applyRouteResourceInvalidations(
          currentResourceCache,
          previousMatch.route?.invalidateOnLeave,
        );

        if (previousMatch.route?.leave) {
          if (typeof previousMatch.route.leave === "string") {
            await currentExecute(
              { type: "run-workflow", workflow: previousMatch.route.leave },
              {
                route: {
                  id: previousMatch.route.id,
                  path: previousMatch.currentPath,
                  pattern: previousMatch.route.path,
                  params: previousMatch.params,
                  query: previousMatch.query,
                },
                params: previousMatch.params,
              },
            );
          } else {
            await currentExecute(previousMatch.route.leave as never, {
              route: {
                id: previousMatch.route.id,
                path: previousMatch.currentPath,
                pattern: previousMatch.route.path,
                params: previousMatch.params,
                query: previousMatch.query,
              },
              params: previousMatch.params,
            });
          }
        }
      }

      previousMatchRef.current = {
        route,
        currentPath: scopedCurrentPath,
        params,
        query: routeQuery,
      };

      applyRouteResourceInvalidations(currentResourceCache, route.refreshOnEnter);

      if (route.preload && route.preload.length > 0) {
        setIsPreloading(true);
        try {
          await Promise.all(
            route.preload.map((preloadTarget) => {
              if (!currentResourceCache) {
                return Promise.resolve();
              }

              const resolvedTarget = resolveRoutePreloadTarget(
                preloadTarget,
                params,
              );
              return currentResourceCache.loadTarget(
                resolvedTarget.target,
                resolvedTarget.params,
                { signal: abortController.signal },
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

      if (
        route.enter &&
        !shouldSkipImmediateRouteEnterReplay(routeEnterReplayKey)
      ) {
        if (typeof route.enter === "string") {
          await currentExecute(
            { type: "run-workflow", workflow: route.enter },
            {
              route: {
                id: route.id,
                path: scopedCurrentPath,
                pattern: route.path,
                params,
                query: routeQuery,
              },
              params,
            },
          );
        } else {
          await currentExecute(route.enter as never, {
            route: {
              id: route.id,
              path: scopedCurrentPath,
              pattern: route.path,
              params,
              query: routeQuery,
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
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setRuntimeError(
        error instanceof Error ? error : new Error("Manifest route failed"),
      );
    });

    return () => {
      cancelled = true;
      abortController.abort();
    };
    // Route lifecycle should only re-fire on actual route location changes, not when
    // callback identities shift.  execute and resourceCache are accessed via
    // refs so they always reflect the latest value without being deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, route, routeAllowed, scopedCurrentLocation]);

  if (subAppMatch) {
    if (typeof window === "undefined") {
      return (
        <Suspense
          fallback={
            <AppFallback
              manifest={localizedManifest}
              name="loading"
              api={api}
            />
          }
        >
          <AppFallback manifest={localizedManifest} name="loading" api={api} />
        </Suspense>
      );
    }

    if (!subAppClients) {
      return null;
    }

    const subAppTree = (
      <ManifestRuntimeProvider
        manifest={subAppMatch.subManifest}
        api={api}
        clients={subAppClients}
      >
        <ManifestRouter
          manifest={subAppMatch.subManifest}
          api={api}
          snapshot={snapshot}
          runtimeClients={subAppClients}
          lazyComponents={lazyComponents}
          basePath={subAppMatch.mountPath}
          parentTheme={localizedManifest.theme ?? parentTheme}
          parentPolicies={policyMap}
        />
      </ManifestRuntimeProvider>
    );

    if (!subAppMatch.inherit.state) {
      return (
        <AppContextProvider
          globals={subAppMatch.subManifest.state}
          resources={subAppMatch.subManifest.resources}
          api={api}
        >
          {subAppTree}
        </AppContextProvider>
      );
    }

    return subAppTree;
  }

  if (!route) {
    return (
      <AppFallback manifest={localizedManifest} name="notFound" api={api} />
    );
  }

  if (lazyComponents && lazyRouteKey !== nextLazyRouteKey) {
    return (
      <div data-snapshot-lazy-loading="" style={{ padding: "1rem" }}>
        Loading route...
      </div>
    );
  }

  if (runtimeError) {
    return <AppFallback manifest={localizedManifest} name="error" api={api} />;
  }

  if (isOffline) {
    return (
      <AppFallback manifest={localizedManifest} name="offline" api={api} />
    );
  }

  if (guardUsesAuthState(route.guard) && authLoading) {
    return (
      <div data-snapshot-auth-loading="" style={{ padding: "1rem" }}>
        <AppFallback manifest={localizedManifest} name="loading" api={api} />
      </div>
    );
  }

  if (!routeAllowed && routeGuardResult.render) {
    return (
      <RouteRuntimeProvider
        value={{
          currentPath: scopedCurrentPath,
          currentRoute: route,
          match,
          params,
          query: routeQuery,
          navigate,
          isPreloading,
        }}
      >
        <ManifestErrorBoundary
          key={`${scopedCurrentPath}:${route.id}:guard`}
          fallback={
            <AppFallback manifest={localizedManifest} name="error" api={api} />
          }
          onError={setRuntimeError}
        >
          <ComponentRenderer config={routeGuardResult.render} />
        </ManifestErrorBoundary>
        <OverlayHost overlays={localizedManifest.overlays} />
      </RouteRuntimeProvider>
    );
  }

  if (!routeAllowed) {
    return null;
  }

  return (
    <RouteRuntimeProvider
      value={{
        currentPath: scopedCurrentPath,
        currentRoute: route,
        match,
        params,
        query: routeQuery,
        navigate,
        isPreloading,
      }}
    >
      <ManifestErrorBoundary
        key={`${scopedCurrentPath}:${route.id}`}
        fallback={
          <AppFallback manifest={localizedManifest} name="error" api={api} />
        }
        onError={setRuntimeError}
      >
        <AppShell
          manifest={localizedManifest}
          route={route}
          parents={match.parents}
          currentPath={scopedCurrentPath}
          navigate={navigate}
          isPreloading={isPreloading}
          api={api}
        />
      </ManifestErrorBoundary>
      <OverlayHost overlays={localizedManifest.overlays} />
    </RouteRuntimeProvider>
  );
}

const THEME_STORAGE_KEY = "snapshot-theme-mode";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyDarkClass(mode: "light" | "dark" | "system") {
  if (typeof document === "undefined") return;
  const resolved = mode === "system" ? getSystemPreference() : mode;
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function DarkModeManager({ themeMode }: { themeMode?: "light" | "dark" | "system" }) {
  const [mode, setMode] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return themeMode ?? "light";
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return themeMode ?? "light";
  });

  // Apply immediately to prevent flash
  useLayoutEffect(() => {
    applyDarkClass(mode);
  }, [mode]);

  // Listen for system preference changes when mode is "system"
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyDarkClass("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  // Listen for set-theme actions via custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.mode === "light" || detail?.mode === "dark" || detail?.mode === "system") {
        setMode(detail.mode);
      } else if (detail?.mode === "toggle") {
        setMode((prev) => {
          const resolved = prev === "system" ? getSystemPreference() : prev;
          return resolved === "dark" ? "light" : "dark";
        });
      }
    };
    window.addEventListener("snapshot:set-theme", handler);
    return () => window.removeEventListener("snapshot:set-theme", handler);
  }, []);

  return null;
}

function collectFallbackComponentTypes(
  manifest: CompiledManifest,
  types: Set<string>,
): void {
  (Object.keys(FALLBACK_COMPONENT_TYPES) as AppFallbackName[]).forEach((name) => {
    const configured = manifest.app[name];

    if (typeof configured === "string") {
      const route = resolveRouteByTarget(manifest, configured);
      if (route) {
        collectComponentTypes(route.page, types);
      }
      return;
    }

    if (configured && typeof configured === "object") {
      collectComponentTypes(configured, types);
      return;
    }

    types.add(FALLBACK_COMPONENT_TYPES[name]);
  });
}

function collectRouteRenderTypes(
  manifest: CompiledManifest,
  routes: CompiledRoute[],
): string[] {
  const types = new Set<string>();

  routes.forEach((route) => {
    collectComponentTypes(route, types);
    collectComponentTypes(route.page, types);
    collectComponentTypes(readRouteSlots(manifest, route.id), types);

    readRouteLayouts(manifest, route.id).forEach((layout) => {
      if (typeof layout === "string") {
        return;
      }

      collectComponentTypes(layout.slots, types);
      collectComponentTypes(layout.props, types);
    });
  });

  collectComponentTypes(manifest.overlays, types);
  collectFallbackComponentTypes(manifest, types);

  return [...types];
}

interface ManifestCompileIssue {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

function toManifestCompileIssues(error: Error): ManifestCompileIssue[] {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      expected:
        "expected" in issue && issue.expected !== undefined
          ? String(issue.expected)
          : undefined,
      received:
        "received" in issue && issue.received !== undefined
          ? String(issue.received)
          : undefined,
    }));
  }

  return [
    {
      path: "",
      message: error.message,
    },
  ];
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
  lazyComponents = false,
}: ManifestAppProps) {
  bootBuiltins();
  const isDev =
    typeof process !== "undefined" && process.env.NODE_ENV !== "production";
  const compileState = useMemo(() => {
    try {
      return {
        compiled: compileManifest(manifest),
        error: null as Error | null,
      };
    } catch (error) {
      const resolvedError =
        error instanceof Error
          ? error
          : new Error("Manifest compilation failed");
      if (!isDev) {
        throw resolvedError;
      }
      return {
        compiled: null,
        error: resolvedError,
      };
    }
  }, [isDev, manifest]);

  if (compileState.error && !compileState.compiled) {
    return isDev ? (
      <ManifestErrorOverlay errors={toManifestCompileIssues(compileState.error)} />
    ) : null;
  }

  const compiledManifest = compileState.compiled!;
  const runtimeApiUrl = compiledManifest.app.apiUrl ?? apiUrl;
  const runtimeManifest = useMemo<CompiledManifest>(() => {
    return {
      ...compiledManifest,
      app: {
        ...compiledManifest.app,
        apiUrl: runtimeApiUrl,
      },
      auth: compiledManifest.auth
        ? {
            ...compiledManifest.auth,
            contract: mergeContract(
              runtimeApiUrl,
              compiledManifest.auth.contract as Parameters<
                typeof mergeContract
              >[1],
            ),
          }
        : compiledManifest.auth,
    };
  }, [compiledManifest, runtimeApiUrl]);
  const tokenCss = useMemo(
    () => resolveTokens(runtimeManifest.theme ?? {}),
    [runtimeManifest.theme],
  );
  const frameworkCss = useMemo(
    () =>
      resolveFrameworkStyles({
        respectReducedMotion:
          runtimeManifest.app.a11y?.respectReducedMotion !== false,
      }),
    [runtimeManifest.app.a11y?.respectReducedMotion],
  );
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl: runtimeApiUrl,
        manifest: compiledManifest.raw,
      }),
    [compiledManifest.raw, runtimeApiUrl],
  );
  const runtimeClients = useMemo(
    () => buildManifestClientMap(runtimeManifest, snapshot),
    [runtimeManifest, snapshot],
  );

  useEffect(() => {
    if (!isDev) {
      return;
    }

    validateContrast(runtimeManifest.theme);
  }, [runtimeManifest.theme, isDev]);

  useLayoutEffect(() => {
    resetLazyRegistry();

    if (lazyComponents) {
      resetRegisteredComponents();
      return;
    }

    registerBuiltInComponents(true);
  }, [lazyComponents, runtimeManifest]);

  return (
    <snapshot.QueryProvider>
      <SkipLinks links={runtimeManifest.app.a11y?.skipLinks} />
      <div aria-hidden="true" hidden data-snapshot-token-styles="">
        <style
          id="snapshot-tokens"
          dangerouslySetInnerHTML={{ __html: tokenCss }}
        />
        <style
          id="snapshot-framework"
          dangerouslySetInnerHTML={{ __html: frameworkCss }}
        />
      </div>
      <DarkModeManager themeMode={runtimeManifest.theme?.mode as "light" | "dark" | "system" | undefined} />
      <ManifestRuntimeProvider
        manifest={runtimeManifest}
        api={snapshot.api}
        clients={runtimeClients}
      >
        <AppContextProvider
          globals={runtimeManifest.state}
          resources={runtimeManifest.resources}
          api={snapshot.api}
        >
          <SnapshotDragDropProvider>
            <ManifestApiHeadersBridge
              manifest={runtimeManifest}
              api={snapshot.api}
              clients={runtimeClients}
            />
            {runtimeManifest.auth || runtimeManifest.realtime ? (
              <>
                <AuthRuntimeBridge
                  manifest={runtimeManifest}
                  useUser={snapshot.useUser}
                />
                <ManifestAuthWorkflowBridge manifest={runtimeManifest} />
                <ManifestRealtimeWorkflowBridge manifest={runtimeManifest} />
              </>
            ) : null}
            <ManifestRouter
              manifest={runtimeManifest}
              api={snapshot.api}
              snapshot={snapshot}
              runtimeClients={runtimeClients}
              lazyComponents={lazyComponents}
            />
            <ToastContainer />
            {isDev ? <ComponentInspector /> : null}
          </SnapshotDragDropProvider>
        </AppContextProvider>
      </ManifestRuntimeProvider>
    </snapshot.QueryProvider>
  );
}
