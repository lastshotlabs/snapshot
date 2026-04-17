import type { z } from "zod";
import type { StateConfigMap } from "@lastshotlabs/frontend-contract/state";
import type {
  analyticsConfigSchema,
  appConfigSchema,
  authProviderSchema,
  manifestConfigSchema,
  observabilityConfigSchema,
  authScreenConfigSchema,
  pushConfigSchema,
  realtimeConfigSchema,
  realtimeSseEndpointSchema,
  realtimeWsSchema,
  pageConfigSchema,
  routeConfigSchema,
  routeGuardConfigSchema,
  routeGuardSchema,
  routeTransitionSchema,
  navigationConfigSchema,
  stateValueConfigSchema,
  overlayConfigSchema,
  baseComponentConfigSchema,
  cardConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  outletComponentSchema,
  toastConfigSchema,
} from "./schema";
import type { FromRef } from "../context/types";
import type { Responsive, ThemeConfig } from "../tokens/types";
import type { EndpointTarget, ResourceMap, ResolvedRequest } from "./resources";
import type {
  CustomWorkflowActionDeclarationMap,
  WorkflowDefinition,
  WorkflowMap,
} from "../workflows/types";
import type { ApiClientLike } from "../../api/client";

/**
 * Raw manifest input shape accepted by `parseManifest()` before defaults are
 * applied during compilation.
 */
export type ManifestConfig = Omit<
  z.input<typeof manifestConfigSchema>,
  "workflows"
> & {
  __runtime?: ManifestRuntimeExtensions;
  workflows?: {
    actions?: {
      custom?: CustomWorkflowActionDeclarationMap;
    };
    [name: string]:
      | WorkflowDefinition
      | {
          custom?: CustomWorkflowActionDeclarationMap;
        }
      | undefined;
  };
};
/**
 * Parsed manifest shape after Zod defaults are applied.
 */
export type ParsedManifestConfig = z.infer<typeof manifestConfigSchema>;
/** Input shape for `appConfigSchema` — defaulted fields are optional. */
export type AppConfig = Resolved<z.input<typeof appConfigSchema>>;
/** Input shape for `toastConfigSchema` — defaulted fields are optional. */
export type ToastConfig = z.input<typeof toastConfigSchema>;
/** Input shape for `analyticsConfigSchema` — defaulted fields are optional. */
export type AnalyticsConfig = Resolved<z.input<typeof analyticsConfigSchema>>;
/** Input shape for `observabilityConfigSchema` — defaulted fields are optional. */
export type ObservabilityConfig = Resolved<
  z.input<typeof observabilityConfigSchema>
>;
/** Input shape for `pushConfigSchema` — defaulted fields are optional. */
export type PushConfig = Resolved<z.input<typeof pushConfigSchema>>;
/** Input shape for `authProviderSchema` — defaulted fields are optional. */
export type AuthProviderConfig = Resolved<z.input<typeof authProviderSchema>>;
/** Input shape for `authScreenConfigSchema` — defaulted fields are optional. */
export type AuthScreenConfig = Resolved<z.input<typeof authScreenConfigSchema>>;
/** Input shape for `realtimeWsSchema` — defaulted fields are optional. */
export type RealtimeWsConfig = Resolved<z.input<typeof realtimeWsSchema>>;
/** Input shape for `realtimeSseEndpointSchema` — defaulted fields are optional. */
export type RealtimeSseEndpointConfig = Resolved<
  z.input<typeof realtimeSseEndpointSchema>
>;
/** Input shape for `realtimeConfigSchema` — defaulted fields are optional. */
export type RealtimeConfig = Resolved<z.input<typeof realtimeConfigSchema>>;
/** Input shape for `pageConfigSchema` — defaulted fields are optional. */
export type PageConfig = Resolved<z.input<typeof pageConfigSchema>>;
/** Input shape for `routeConfigSchema` — defaulted fields are optional. */
export type RouteConfig = Resolved<z.input<typeof routeConfigSchema>>;
export type RouteTransitionConfig = Resolved<
  z.input<typeof routeTransitionSchema>
>;
/** Input shape for `routeGuardConfigSchema` — defaulted fields are optional. */
export type RouteGuardConfig = Resolved<z.input<typeof routeGuardConfigSchema>>;
/** Input shape for `routeGuardSchema` — defaulted fields are optional. */
export type RouteGuard = Resolved<z.input<typeof routeGuardSchema>>;
/** Input shape for `navigationConfigSchema` — defaulted fields are optional. */
export type NavigationConfig = z.input<typeof navigationConfigSchema>;
/** Input shape for `stateValueConfigSchema` — defaulted fields are optional. */
export type StateValueConfig = z.input<typeof stateValueConfigSchema>;
/** Named manifest state map keyed by state id. */
export type StateConfig = StateConfigMap;

// ── Parsed (output) types for internal/runtime use ──────────────────────────
// After Zod parsing, all defaults are applied so every field is present.
// These are used by CompiledManifest/CompiledRoute and internal runtime code.

/** @internal Parsed app config with all defaults applied. */
export type ParsedAppConfig = Resolved<z.infer<typeof appConfigSchema>>;
/** @internal Parsed auth config with all defaults applied. */
export type ParsedAuthScreenConfig = Resolved<z.infer<typeof authScreenConfigSchema>>;
/** @internal Parsed route config with all defaults applied. */
export type ParsedRouteConfig = Resolved<z.infer<typeof routeConfigSchema>>;
/** @internal Parsed route transition config with all defaults applied. */
export type ParsedRouteTransitionConfig = Resolved<z.infer<typeof routeTransitionSchema>>;
/** @internal Parsed page config with all defaults applied. */
export type ParsedPageConfig = Resolved<z.infer<typeof pageConfigSchema>>;
/** @internal Parsed route guard with all defaults applied. */
export type ParsedRouteGuard = Resolved<z.infer<typeof routeGuardSchema>>;
/** @internal Parsed toast config with all defaults applied. */
export type ParsedToastConfig = z.infer<typeof toastConfigSchema>;
/** @internal Parsed analytics config with all defaults applied. */
export type ParsedAnalyticsConfig = Resolved<z.infer<typeof analyticsConfigSchema>>;
/** @internal Parsed observability config with all defaults applied. */
export type ParsedObservabilityConfig = Resolved<z.infer<typeof observabilityConfigSchema>>;
/** @internal Parsed push config with all defaults applied. */
export type ParsedPushConfig = Resolved<z.infer<typeof pushConfigSchema>>;
/** @internal Parsed overlay config with all defaults applied. */
export type ParsedOverlayConfig = Resolved<z.infer<typeof overlayConfigSchema>>;
/** @internal Parsed navigation config with all defaults applied. */
export type ParsedNavigationConfig = z.infer<typeof navigationConfigSchema>;
/** @internal Parsed realtime config with all defaults applied. */
export type ParsedRealtimeConfig = Resolved<z.infer<typeof realtimeConfigSchema>>;
/** Named manifest resource map keyed by resource id. */
export type ResourceConfigMap = ResourceMap;
export interface ManifestResourceLoaderContext {
  manifest: CompiledManifest;
  resourceName: string;
  params: Record<string, unknown>;
  request: ResolvedRequest & { url: string };
  signal?: AbortSignal;
  client: ApiClientLike;
  clients: Record<string, ApiClientLike>;
  loadTarget: (
    target: EndpointTarget,
    params?: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
}
export type ManifestResourceLoader = (
  context: ManifestResourceLoaderContext,
) => Promise<unknown>;
export interface ManifestRuntimeExtensions {
  resources?: Record<
    string,
    {
      load?: ManifestResourceLoader;
    }
  >;
}
/** Input shape for `overlayConfigSchema` — defaulted fields are optional. */
export type OverlayConfig = Resolved<z.input<typeof overlayConfigSchema>>;
/** Input shape for `baseComponentConfigSchema` — defaulted fields are optional. */
export type BaseComponentConfig = Resolved<
  z.input<typeof baseComponentConfigSchema>
>;
/** Input shape for `headingConfigSchema` — defaulted fields are optional. */
export type HeadingConfig = Resolved<z.input<typeof headingConfigSchema>>;
/** Input shape for `buttonConfigSchema` — defaulted fields are optional. */
export type ButtonConfig = Resolved<z.input<typeof buttonConfigSchema>>;
/** Input shape for `selectConfigSchema` — defaulted fields are optional. */
export type SelectConfig = Resolved<z.input<typeof selectConfigSchema>>;
/** Input shape for `cardConfigSchema` — defaulted fields are optional. */
export type CardConfig = Resolved<z.input<typeof cardConfigSchema>>;
/** Input shape for `outletComponentSchema` — defaulted fields are optional. */
export type OutletConfig = Resolved<z.input<typeof outletComponentSchema>>;

type EnvRefLike = {
  env: string;
  default?: string;
};

type TRefLike = {
  t: string;
  vars?: Record<string, unknown>;
};

/**
 * Recursively resolve env-reference-shaped values to plain strings.
 *
 * @template T - Input type
 */
export type Resolved<T> = T extends EnvRefLike
  ? string
  : T extends TRefLike
    ? string
    : T extends ReadonlyArray<infer U>
      ? Resolved<U>[]
      : T extends Array<infer U>
        ? Resolved<U>[]
        : T extends object
          ? {
              [K in keyof T]: Resolved<T[K]>;
            }
          : T;

/**
 * Navigation item rendered by Snapshot navigation components.
 */
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  visible?: boolean | FromRef;
  disabled?: boolean | FromRef;
  authenticated?: boolean;
  roles?: string[];
  badge?: number | FromRef;
  children?: NavItem[];
}

/**
 * Runtime config for the built-in `row` layout component.
 */
export interface RowConfig extends BaseComponentConfig {
  type: "row";
  gap?: Responsive<"none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl">;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
  overflow?: "auto" | "hidden" | "scroll" | "visible";
  maxHeight?: string;
  children: ComponentConfig[];
}

/**
 * Runtime config union for manifest-renderable components.
 */
export type ComponentConfig =
  | RowConfig
  | HeadingConfig
  | ButtonConfig
  | SelectConfig
  | CardConfig
  | OutletConfig
  | (BaseComponentConfig & Record<string, unknown>);

/**
 * Runtime route shape produced by `compileManifest()`.
 */
export interface CompiledRoute {
  id: string;
  path: string;
  parentId?: string | null;
  parentPath?: string | null;
  page: ParsedPageConfig;
  preload?: EndpointTarget[];
  prefetch?: EndpointTarget[];
  refreshOnEnter?: string[];
  invalidateOnLeave?: string[];
  enter?: ParsedRouteConfig["enter"];
  leave?: ParsedRouteConfig["leave"];
  guard?: ParsedRouteGuard;
  events?: ParsedRouteConfig["events"];
  transition?: ParsedRouteTransitionConfig;
}

/**
 * Resolved route match for the current pathname.
 */
export interface RouteMatch {
  route: CompiledRoute | null;
  params: Record<string, string>;
  parents: CompiledRoute[];
  activeRoutes: CompiledRoute[];
}

/**
 * Runtime manifest shape produced by `compileManifest()`.
 */
export interface CompiledManifest {
  raw: ParsedManifestConfig;
  __runtime?: ManifestRuntimeExtensions;
  app: ParsedAppConfig;
  toast?: ParsedToastConfig;
  analytics?: ParsedAnalyticsConfig;
  observability?: ParsedObservabilityConfig;
  push?: ParsedPushConfig;
  theme?: ThemeConfig;
  state?: StateConfig;
  resources?: ResourceConfigMap;
  workflows?: WorkflowMap;
  overlays?: Record<string, ParsedOverlayConfig>;
  navigation?: ParsedNavigationConfig;
  auth?: ParsedAuthScreenConfig;
  realtime?: ParsedRealtimeConfig;
  routes: CompiledRoute[];
  routeMap: Record<string, CompiledRoute>;
  firstRoute: CompiledRoute | null;
}

/**
 * Props accepted by the `ManifestApp` component.
 */
export interface ManifestAppProps {
  manifest: ManifestConfig;
  apiUrl: string;
  lazyComponents?: boolean;
}

/**
 * React component type that can participate in the config-driven manifest runtime.
 */
export type ConfigDrivenComponent = React.ComponentType<{
  config: Record<string, unknown>;
}>;
