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
import type { EndpointTarget, ResourceConfig, ResourceMap } from "./resources";
import type {
  CustomWorkflowActionDeclarationMap,
  WorkflowDefinition,
  WorkflowMap,
} from "../workflows/types";

/**
 * Raw manifest input shape accepted by `parseManifest()` before defaults are
 * applied during compilation.
 */
export type ManifestConfig = Omit<
  z.input<typeof manifestConfigSchema>,
  "workflows"
> & {
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
/** Resolved runtime view of `appConfigSchema`. */
export type AppConfig = Resolved<z.infer<typeof appConfigSchema>>;
/** Resolved runtime view of `toastConfigSchema`. */
export type ToastConfig = z.infer<typeof toastConfigSchema>;
/** Resolved runtime view of `analyticsConfigSchema`. */
export type AnalyticsConfig = Resolved<z.infer<typeof analyticsConfigSchema>>;
/** Resolved runtime view of `observabilityConfigSchema`. */
export type ObservabilityConfig = Resolved<
  z.infer<typeof observabilityConfigSchema>
>;
/** Resolved runtime view of `pushConfigSchema`. */
export type PushConfig = Resolved<z.infer<typeof pushConfigSchema>>;
/** Resolved runtime view of `authProviderSchema`. */
export type AuthProviderConfig = Resolved<z.infer<typeof authProviderSchema>>;
/** Resolved runtime view of `authScreenConfigSchema`. */
export type AuthScreenConfig = Resolved<z.infer<typeof authScreenConfigSchema>>;
/** Resolved runtime view of `realtimeWsSchema`. */
export type RealtimeWsConfig = Resolved<z.infer<typeof realtimeWsSchema>>;
/** Resolved runtime view of `realtimeSseEndpointSchema`. */
export type RealtimeSseEndpointConfig = Resolved<
  z.infer<typeof realtimeSseEndpointSchema>
>;
/** Resolved runtime view of `realtimeConfigSchema`. */
export type RealtimeConfig = Resolved<z.infer<typeof realtimeConfigSchema>>;
/** Resolved runtime view of `pageConfigSchema`. */
export type PageConfig = Resolved<z.infer<typeof pageConfigSchema>>;
/** Resolved runtime view of `routeConfigSchema`. */
export type RouteConfig = Resolved<z.infer<typeof routeConfigSchema>>;
export type RouteTransitionConfig = Resolved<
  z.infer<typeof routeTransitionSchema>
>;
/** Resolved runtime view of `routeGuardConfigSchema`. */
export type RouteGuardConfig = Resolved<z.infer<typeof routeGuardConfigSchema>>;
/** Resolved runtime view of `routeGuardSchema`. */
export type RouteGuard = Resolved<z.infer<typeof routeGuardSchema>>;
/** Runtime view of `navigationConfigSchema`. Navigation labels remain locale-resolved at render time. */
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
/** Runtime state declaration for a single named manifest state value. */
export type StateValueConfig = z.infer<typeof stateValueConfigSchema>;
/** Named manifest state map keyed by state id. */
export type StateConfig = StateConfigMap;
/** Named manifest resource map keyed by resource id. */
export type ResourceConfigMap = ResourceMap;
/** Resolved runtime view of `overlayConfigSchema`. */
export type OverlayConfig = Resolved<z.infer<typeof overlayConfigSchema>>;
/** Resolved runtime view of `baseComponentConfigSchema`. */
export type BaseComponentConfig = Resolved<
  z.infer<typeof baseComponentConfigSchema>
>;
/** Resolved runtime view of `headingConfigSchema`. */
export type HeadingConfig = Resolved<z.infer<typeof headingConfigSchema>>;
/** Resolved runtime view of `buttonConfigSchema`. */
export type ButtonConfig = Resolved<z.infer<typeof buttonConfigSchema>>;
/** Resolved runtime view of `selectConfigSchema`. */
export type SelectConfig = Resolved<z.infer<typeof selectConfigSchema>>;
/** Resolved runtime view of `cardConfigSchema`. */
export type CardConfig = Resolved<z.infer<typeof cardConfigSchema>>;
/** Resolved runtime view of `outletComponentSchema`. */
export type OutletConfig = Resolved<z.infer<typeof outletComponentSchema>>;

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
  page: PageConfig;
  preload?: EndpointTarget[];
  prefetch?: EndpointTarget[];
  refreshOnEnter?: string[];
  invalidateOnLeave?: string[];
  enter?: RouteConfig["enter"];
  leave?: RouteConfig["leave"];
  guard?: RouteGuard;
  events?: RouteConfig["events"];
  transition?: RouteTransitionConfig;
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
  app: AppConfig;
  toast?: ToastConfig;
  analytics?: AnalyticsConfig;
  observability?: ObservabilityConfig;
  push?: PushConfig;
  theme?: ThemeConfig;
  state?: StateConfig;
  resources?: ResourceConfigMap;
  workflows?: WorkflowMap;
  overlays?: Record<string, OverlayConfig>;
  navigation?: NavigationConfig;
  auth?: AuthScreenConfig;
  realtime?: RealtimeConfig;
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
