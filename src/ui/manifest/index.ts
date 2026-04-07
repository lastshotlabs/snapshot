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
  navItemSchema,
  authScreenConfigSchema,
  pageConfigSchema,
  manifestConfigSchema,
} from "./schema";

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
  ManifestConfig,
  NavItem,
  AuthScreenConfig,
  PageConfig,
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
