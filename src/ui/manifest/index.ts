// Schema & validation
export {
  fromRefSchema,
  registerComponentSchema,
  getRegisteredSchemaTypes,
  baseComponentConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
  componentConfigSchema,
  appConfigSchema,
  navItemSchema,
  navigationConfigSchema,
  authScreenConfigSchema,
  pageConfigSchema,
  routeConfigSchema,
  stateValueConfigSchema,
  manifestConfigSchema,
} from "./schema";

// Compiler
export {
  compileManifest,
  defineManifest,
  parseManifest,
  safeCompileManifest,
  safeParseManifest,
} from "./compiler";

// Component registry
export {
  registerComponent,
  getRegisteredComponent,
} from "./component-registry";

// Rendering
export { ComponentRenderer, PageRenderer } from "./renderer";
export type { ComponentRendererProps, PageRendererProps } from "./renderer";

// App
export { ManifestApp, injectStyleSheet } from "./app";

// Types
export type {
  AppConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  NavItem,
  NavigationConfig,
  AuthScreenConfig,
  PageConfig,
  RouteConfig,
  StateConfig,
  StateValueConfig,
  BaseComponentConfig,
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
  CustomComponentConfig,
  ComponentConfig,
  ManifestAppProps,
  ConfigDrivenComponent,
} from "./types";

// Structural component side-effect registration
import "./structural";
