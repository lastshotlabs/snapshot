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
import {
  ApiClient,
  getRegisteredClient,
  type ApiClientLike,
} from "../../api/client";
import { mergeContract } from "../../auth/contract";
import { createSnapshot } from "../../create-snapshot";
import { SnapshotApiContext, useActionExecutor } from "../actions/executor";
import { ToastContainer } from "../actions/toast";
import {
  AppContextProvider,
  useResolveFrom,
  useSubscribe,
} from "../context/index";
import { Layout } from "../components/layout/layout";
import { Nav } from "../components/layout/nav";
import { DrawerComponent } from "../components/overlay/drawer";
import { ModalComponent } from "../components/overlay/modal";
import { useSetStateValue, useStateValue } from "../state";
import { resolveDetectedLocale, resolveI18nRefs } from "../i18n/resolve";
import type { PolicyExpr } from "../policies/types";
import { resolveTokens } from "../tokens/resolve";
import { getAuthScreenPath } from "./auth-routes";
import { compileManifest } from "./compiler";
import {
  evaluateManifestGuard,
  guardUsesAuthState,
} from "./guard-registry";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
  useManifestResourceCache,
} from "./runtime";
import { normalizePathname, resolveRouteMatch } from "./router";
import { ComponentRenderer, PageRenderer } from "./renderer";
import type { EndpointTarget } from "./resources";
import type {
  ComponentConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestAppProps,
  OverlayConfig,
} from "./types";
import { bootBuiltins } from "./boot-builtins";
import { resolveTemplate } from "../expressions/template";

const EMPTY_OBJECT: Record<string, unknown> = {};

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
  const subApps = manifest.raw.subApps;
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

  for (const [name, config] of Object.entries(manifest.raw.clients ?? {})) {
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

  return rawRoutes.find((route) => {
    if (!isRecord(route)) {
      return false;
    }

    return route["id"] === routeId;
  }) as Record<string, unknown> | undefined;
}

function readRouteLayouts(
  manifest: CompiledManifest,
  routeId: string,
): RouteLayoutDeclaration[] {
  const route = getRawRouteRecord(manifest, routeId);
  const layouts = route?.["layouts"];
  if (!Array.isArray(layouts) || layouts.length === 0) {
    return [manifest.app.shell ?? "full-width"];
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
  const fallbackLogoText =
    (typeof manifest.app.title === "string" ? manifest.app.title.trim() : "") ||
    (typeof manifest.raw.app?.title === "string"
      ? manifest.raw.app.title.trim()
      : "") ||
    "Snapshot";
  const navConfig = manifest.navigation
    ? ({
        type: "nav",
        items: manifest.navigation.items,
        collapsible: true,
        userMenu: true,
        logo: {
          text: fallbackLogoText,
          path: manifest.app.home ?? manifest.firstRoute?.path ?? "/",
        },
      } as const)
    : null;

  const loadingFallback = (
    <AppFallback manifest={manifest} name="loading" api={api} />
  );
  const routeSlots = readRouteSlots(manifest, route.id);
  const layoutDeclarations = readRouteLayouts(manifest, route.id);
  const slotLayout = layoutDeclarations.find((layout) => layoutSupportsSlots(layout));
  if (Object.keys(routeSlots).length > 0) {
    const layoutType = slotLayout
      ? getLayoutType(slotLayout)
      : getLayoutType(layoutDeclarations[0] ?? "full-width");
    const declaredSlots = new Map<string, RouteLayoutSlotDeclaration>();
    for (const slot of getBuiltInLayoutSlots(layoutType)) {
      declaredSlots.set(slot.name, slot);
    }
    if (slotLayout) {
      for (const slot of getLayoutSlots(slotLayout)) {
        declaredSlots.set(slot.name, slot);
      }
    }
    const availableSlots = [...declaredSlots.keys()];
    for (const slotName of Object.keys(routeSlots)) {
      if (!declaredSlots.has(slotName)) {
        throw new Error(
          `Layout "${layoutType}" does not declare slot "${slotName}". Available slots: ${availableSlots.join(", ")}.`,
        );
      }
    }
  }
  const page = isPreloading ? (
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
  );

  const renderSlot = (
    layoutType: string,
    declaration: RouteLayoutSlotDeclaration | undefined,
    defaultContent?: ReactNode,
  ): ReactNode => {
    const routeSlotConfigs = routeSlots[declaration?.name ?? ""] ?? [];
    const hasRouteContent = routeSlotConfigs.length > 0;

    const content = hasRouteContent ? (
      <>
        {routeSlotConfigs.map((slotConfig, index) => (
          <ComponentRenderer
            key={`slot:${declaration?.name ?? "unknown"}:${index}`}
            config={slotConfig}
          />
        ))}
      </>
    ) : declaration?.fallback ? (
      <ComponentRenderer config={declaration.fallback} />
    ) : (
      (defaultContent ?? null)
    );

    if (!content) {
      if (declaration?.required) {
        throw new Error(
          `Layout "${layoutType}" requires slot "${declaration.name}" but no content was provided.`,
        );
      }
      return null;
    }

    const suspenseFallback = declaration?.fallback ? (
      <ComponentRenderer config={declaration.fallback} />
    ) : (
      loadingFallback
    );

    return (
      <Suspense
        key={`slot-boundary:${layoutType}:${declaration?.name ?? "main"}`}
        fallback={suspenseFallback}
      >
        {content}
      </Suspense>
    );
  };

  return layoutDeclarations.reduceRight<ReactNode>(
    (children, layout, index) => {
      const layoutType = getLayoutType(layout);
      const declaredSlots = new Map<string, RouteLayoutSlotDeclaration>();
      for (const slot of getBuiltInLayoutSlots(layoutType)) {
        declaredSlots.set(slot.name, slot);
      }
      for (const slot of getLayoutSlots(layout)) {
        declaredSlots.set(slot.name, slot);
      }

      const slotContent = layoutSupportsSlots(layout)
        ? Object.fromEntries(
            [...declaredSlots.entries()].map(([slotName, declaration]) => [
              slotName,
              renderSlot(
                layoutType,
                declaration,
                slotName === "main" ? children : undefined,
              ),
            ]),
          )
        : undefined;

      const navNode =
        navConfig && (layoutType === "sidebar" || layoutType === "top-nav") ? (
          <Nav
            config={navConfig}
            pathname={currentPath}
            onNavigate={(path) => navigate(path)}
          />
        ) : undefined;

      return (
        <Layout
          key={`layout:${layoutType}:${index}`}
          config={
            {
              type: "layout",
              variant: layoutType,
              ...getLayoutProps(layout),
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
  basePath?: string;
  parentTheme?: CompiledManifest["theme"];
  parentPolicies?: Record<string, PolicyExpr>;
}

function ManifestRouter({
  manifest,
  api,
  snapshot,
  runtimeClients,
  basePath,
  parentTheme,
  parentPolicies,
}: ManifestRouterProps) {
  const [currentLocation, setCurrentLocation] = useState(getBrowserLocation);
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
  const { route, params } = useMemo(
    () =>
      subAppMatch
        ? { route: null, params: {} as Record<string, string> }
        : resolveRouteMatch(localizedManifest, scopedCurrentPath),
    [localizedManifest, scopedCurrentPath, subAppMatch],
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

    const runLifecycle = async () => {
      const previousMatch = previousMatchRef.current;
      if (
        previousMatch &&
        (previousMatch.currentPath !== scopedCurrentPath ||
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
        currentPath: scopedCurrentPath,
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
                path: scopedCurrentPath,
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
              path: scopedCurrentPath,
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
  }, [execute, params, resourceCache, route, routeAllowed, scopedCurrentPath]);

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

/**
 * Render the manifest-driven application shell.
 *
 * @param props - Manifest runtime props
 * @returns A fully rendered manifest application
 */
export function ManifestApp({ manifest, apiUrl }: ManifestAppProps) {
  bootBuiltins();
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  const runtimeApiUrl = compiledManifest.app.apiUrl ?? apiUrl;
  const tokenCss = useMemo(
    () => resolveTokens(compiledManifest.theme ?? {}),
    [compiledManifest.theme],
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
    () => buildManifestClientMap(compiledManifest, snapshot),
    [compiledManifest, snapshot],
  );

  return (
    <snapshot.QueryProvider>
      <div aria-hidden="true" hidden data-snapshot-token-styles="">
        <style
          id="snapshot-tokens"
          dangerouslySetInnerHTML={{ __html: tokenCss }}
        />
      </div>
      <SnapshotApiContext.Provider value={snapshot.api}>
        <ManifestRuntimeProvider
          manifest={compiledManifest}
          api={snapshot.api}
          clients={runtimeClients}
        >
          <AppContextProvider
            globals={compiledManifest.state}
            resources={compiledManifest.resources}
            api={snapshot.api}
          >
            <ManifestApiHeadersBridge
              manifest={compiledManifest}
              api={snapshot.api}
              clients={runtimeClients}
            />
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
              runtimeClients={runtimeClients}
            />
            <ToastContainer />
          </AppContextProvider>
        </ManifestRuntimeProvider>
      </SnapshotApiContext.Provider>
    </snapshot.QueryProvider>
  );
}
