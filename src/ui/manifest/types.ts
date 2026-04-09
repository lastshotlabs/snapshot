import type { z } from "zod";
import type {
  appConfigSchema,
  manifestConfigSchema,
  authScreenConfigSchema,
  pageConfigSchema,
  routeConfigSchema,
  navigationConfigSchema,
  stateValueConfigSchema,
  overlayConfigSchema,
  baseComponentConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
} from "./schema";
import type { FromRef } from "../context/types";
import type { Responsive, ThemeConfig } from "../tokens/types";
import type {
  EndpointTarget,
  ResourceConfig,
  ResourceMap,
} from "./resources";
import type { WorkflowMap } from "../workflows/types";

export type ManifestConfig = z.infer<typeof manifestConfigSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export type AuthScreenConfig = z.infer<typeof authScreenConfigSchema>;
export type PageConfig = z.infer<typeof pageConfigSchema>;
export type RouteConfig = z.infer<typeof routeConfigSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type StateValueConfig = z.infer<typeof stateValueConfigSchema>;
export type StateConfig = Record<string, StateValueConfig>;
export type ResourceConfigMap = ResourceMap;
export type OverlayConfig = z.infer<typeof overlayConfigSchema>;
export type BaseComponentConfig = z.infer<typeof baseComponentConfigSchema>;
export type HeadingConfig = z.infer<typeof headingConfigSchema>;
export type ButtonConfig = z.infer<typeof buttonConfigSchema>;
export type SelectConfig = z.infer<typeof selectConfigSchema>;
export type CustomComponentConfig = z.infer<typeof customComponentConfigSchema>;

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
  | CustomComponentConfig
  | (BaseComponentConfig & Record<string, unknown>);

export interface CompiledRoute {
  id: string;
  path: string;
  page: PageConfig;
  preload?: EndpointTarget[];
  enter?: RouteConfig["enter"];
  leave?: RouteConfig["leave"];
  guard?: RouteConfig["guard"];
}

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
  routes: CompiledRoute[];
  routeMap: Record<string, CompiledRoute>;
  firstRoute: CompiledRoute | null;
}

export interface ManifestAppProps {
  manifest: ManifestConfig;
  apiUrl: string;
  snapshotConfig?: Record<string, unknown>;
}

export type ConfigDrivenComponent = React.ComponentType<{
  config: Record<string, unknown>;
}>;
