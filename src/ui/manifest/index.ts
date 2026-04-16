// Schema & validation
export {
  fromRefSchema,
  registerComponentSchema,
  getRegisteredSchemaTypes,
  baseComponentConfigSchema,
  suspenseFallbackSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  cardConfigSchema,
  componentsConfigSchema,
  customComponentDeclarationSchema,
  customComponentPropSchema,
  componentConfigSchema,
  appConfigSchema,
  toastConfigSchema,
  analyticsConfigSchema,
  analyticsProviderSchema,
  pushConfigSchema,
  navItemSchema,
  navigationConfigSchema,
  authScreenConfigSchema,
  authProviderSchema,
  realtimeConfigSchema,
  realtimeSseEndpointSchema,
  realtimeWsSchema,
  pageConfigSchema,
  routeGuardConfigSchema,
  routeGuardSchema,
  routeTransitionSchema,
  routeConfigSchema,
  outletComponentSchema,
  overlayConfigSchema,
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
  AssignWorkflowNode,
  CaptureWorkflowNode,
  ParallelWorkflowNode,
  RetryWorkflowNode,
  TryWorkflowNode,
  WaitWorkflowNode,
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
export {
  registerLayout,
  resolveLayout,
  getRegisteredLayouts,
} from "../layouts/registry";
export {
  registerGuard,
  resolveGuard,
  getRegisteredGuards,
} from "./guard-registry";

// Rendering
export { ComponentRenderer, PageRenderer } from "./renderer";
export type { ComponentRendererProps, PageRendererProps } from "./renderer";
export { TransitionWrapper } from "./transition-wrapper";

// App
export { ManifestApp, injectStyleSheet } from "./app";
export { bootBuiltins, resetBootBuiltins } from "./boot-builtins";
export { generateBreadcrumbs } from "./breadcrumbs";
export { generateJsonSchema } from "./json-schema";
export {
  ManifestRuntimeProvider,
  ManifestRuntimeContext,
  OverlayRuntimeProvider,
  RouteRuntimeProvider,
  OverlayRuntimeContext,
  useManifestResourceFocusRefetch,
  useManifestResourceMountRefetch,
  useManifestRuntime,
  useManifestResourceCache,
  useOverlayRuntime,
  useRouteRuntime,
} from "./runtime";
export { useAutoBreadcrumbs } from "../hooks/use-auto-breadcrumbs";
export { useRoutePrefetch } from "./use-route-prefetch";
export { useVirtualList } from "../hooks/use-virtual-list";

// Types
export type {
  AppConfig,
  ToastConfig,
  AnalyticsConfig,
  PushConfig,
  CompiledManifest,
  CompiledRoute,
  RouteMatch,
  ManifestConfig,
  NavItem,
  NavigationConfig,
  AuthScreenConfig,
  AuthProviderConfig,
  RealtimeConfig,
  RealtimeSseEndpointConfig,
  RealtimeWsConfig,
  PageConfig,
  RouteGuard,
  RouteGuardConfig,
  RouteConfig,
  ResourceConfigMap,
  ManifestRuntimeExtensions,
  ManifestResourceLoader,
  ManifestResourceLoaderContext,
  OverlayConfig,
  StateConfig,
  StateValueConfig,
  BaseComponentConfig,
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
  CardConfig,
  OutletConfig,
  ComponentConfig,
  ManifestAppProps,
  ConfigDrivenComponent,
} from "./types";
