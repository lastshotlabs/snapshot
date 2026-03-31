export { frontendManifestSchema } from "./schema";
export { walkComponents, walkAllComponents } from "./walk";
export type {
  FrontendManifest,
  PageConfig,
  ComponentConfig,
  NavItem,
  AuthScreen,
  ThemeConfig,
  FeatureConfig,
  EnvironmentOverride,
} from "./schema";

export {
  createConstraintEngine,
  createDefaultConstraintEngine,
  dataSourceRequired,
  formEndpointRequired,
  navPathExists,
  componentIdUnique,
  fromRefExists,
  layoutChildrenRequired,
  modalIdRequired,
  authScreensValid,
} from "./constraints";
export type {
  ConstraintSeverity,
  ConstraintViolation,
  ConstraintResult,
  ConstraintRule,
  ConstraintEngine,
} from "./constraints";

export { runAudits } from "./audits/runner";
export type { AuditRunnerResult } from "./audits/runner";
export type { AuditSeverity, AuditResult, AuditRule } from "./audits/types";
export { builtinAuditRules } from "./audits/rules";

export { createManifestHandlerRegistry, createDefaultManifestRegistry } from "./registry";
export type {
  HandlerCategory,
  HandlerFactory,
  HandlerRef,
  ManifestHandlerRegistry,
} from "./registry";
