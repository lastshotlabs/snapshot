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

// Resource contracts
export {
  buildRequestUrl,
  dataSourceSchema,
  endpointTargetSchema,
  extractResourceRefs,
  httpMethodSchema,
  isResourceRef,
  resourceConfigSchema,
  resourceRefSchema,
  resolveEndpointTarget,
} from "./resources";

// Workflows
export {
  runWorkflow,
  registerWorkflowAction,
  getRegisteredWorkflowAction,
  workflowConditionSchema,
  workflowDefinitionSchema,
  workflowNodeSchema,
} from "../workflows/index";
export type {
  WorkflowCondition,
  WorkflowConditionOperator,
  WorkflowDefinition,
  WorkflowMap,
  WorkflowNode,
  IfWorkflowNode,
  WorkflowActionHandler,
} from "../workflows/index";

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
export {
  ManifestRuntimeProvider,
  ManifestRuntimeContext,
  useManifestRuntime,
} from "./runtime";

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
  ResourceConfigMap,
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
