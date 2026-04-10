import type { z } from "zod";
import type {
  appConfigSchema,
  manifestConfigSchema,
  authScreenConfigSchema,
  realtimeConfigSchema,
  realtimeSseEndpointSchema,
  realtimeWsSchema,
  pageConfigSchema,
  routeConfigSchema,
  navigationConfigSchema,
  stateValueConfigSchema,
  overlayConfigSchema,
  baseComponentConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
} from "./schema";
import type { FromRef } from "../context/types";
import type { Responsive, ThemeConfig } from "../tokens/types";
import type { EndpointTarget, ResourceConfig, ResourceMap } from "./resources";
import type { WorkflowMap } from "../workflows/types";

export type ManifestConfig = z.infer<typeof manifestConfigSchema>;
/** Resolved runtime view of `appConfigSchema`. */
export type AppConfig = Resolved<z.infer<typeof appConfigSchema>>;
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
/** Resolved runtime view of `navigationConfigSchema`. */
export type NavigationConfig = Resolved<z.infer<typeof navigationConfigSchema>>;
export type StateValueConfig = z.infer<typeof stateValueConfigSchema>;
export type StateConfig = Record<string, StateValueConfig>;
export type ResourceConfigMap = ResourceMap;
/** Resolved runtime view of `overlayConfigSchema`. */
export type OverlayConfig = Resolved<z.infer<typeof overlayConfigSchema>>;
/** Resolved runtime view of `baseComponentConfigSchema`. */
export type BaseComponentConfig = Resolved<z.infer<typeof baseComponentConfigSchema>>;
/** Resolved runtime view of `headingConfigSchema`. */
export type HeadingConfig = Resolved<z.infer<typeof headingConfigSchema>>;
/** Resolved runtime view of `buttonConfigSchema`. */
export type ButtonConfig = Resolved<z.infer<typeof buttonConfigSchema>>;
/** Resolved runtime view of `selectConfigSchema`. */
export type SelectConfig = Resolved<z.infer<typeof selectConfigSchema>>;

type EnvRefLike = {
  env: string;
  default?: string;
};

/**
 * Recursively resolve env-reference-shaped values to plain strings.
 *
 * @template T - Input type
 */
export type Resolved<T> = T extends EnvRefLike
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

export interface RowConfig extends BaseComponentConfig {
  type: "row";
  gap?: Responsive<"xs" | "sm" | "md" | "lg" | "xl">;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
  children: ComponentConfig[];
}

export type ComponentConfig =
  | RowConfig
  | HeadingConfig
  | ButtonConfig
  | SelectConfig
  | (BaseComponentConfig & Record<string, unknown>);

/**
 * Runtime route shape produced by `compileManifest()`.
 */
export interface CompiledRoute {
  id: string;
  path: string;
  page: PageConfig;
  preload?: EndpointTarget[];
  refreshOnEnter?: string[];
  invalidateOnLeave?: string[];
  enter?: RouteConfig["enter"];
  leave?: RouteConfig["leave"];
  guard?: RouteConfig["guard"];
}

/**
 * Runtime manifest shape produced by `compileManifest()`.
 */
export interface CompiledManifest {
  raw: ManifestConfig;
  app: AppConfig;
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

export interface ManifestAppProps {
  manifest: ManifestConfig;
  apiUrl: string;
}

export type ConfigDrivenComponent = React.ComponentType<{
  config: Record<string, unknown>;
}>;
