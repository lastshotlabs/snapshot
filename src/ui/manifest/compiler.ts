import type { SafeParseReturnType, ZodError } from "zod";
import { ACTION_TYPES } from "../actions/types";
import { getMissingAuthScreenIds } from "./auth-routes";
import { getDefaultEnvSource, isEnvRef, resolveEnvRef } from "./env";
import {
  clearCustomFlavors,
  defineFlavorWithExtension,
  getFlavor,
  registerBuiltInFlavors,
} from "../tokens/flavors";
import { collectPolicyRefs, isPolicyRef } from "../policies/types";
import { getRegisteredClient } from "../../api/client";
import { manifestConfigSchema, withManifestCustomComponents } from "./schema";
import { setDeclaredCustomActionSchemas } from "../workflows/registry";
import type {
  AppConfig,
  AuthScreenConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  PageConfig,
  RouteConfig,
} from "./types";
import type {
  CustomWorkflowActionDeclarationMap,
  WorkflowDefinition,
  WorkflowMap,
} from "../workflows/types";
import type { ThemeConfig } from "../tokens/types";

type EnvResolvedManifest = Omit<ManifestConfig, "app" | "auth" | "routes"> & {
  app?: AppConfig;
  auth?: AuthScreenConfig;
  routes: RouteConfig[];
};

const BUILTIN_WORKFLOW_NODE_TYPES = new Set<string>([
  ...ACTION_TYPES,
  "if",
  "wait",
  "parallel",
  "retry",
  "assign",
  "try",
  "capture",
]);

function toPageConfig(route: RouteConfig): PageConfig {
  return {
    title: route.title,
    content: route.content,
    roles: route.roles,
    breadcrumb: route.breadcrumb,
  };
}

function resolveManifestEnvRefs<T>(
  value: T,
  env: Record<string, string | undefined>,
  path: string[] = [],
): T {
  const resolve = (input: unknown, currentPath: string[]): unknown => {
    if (isEnvRef(input)) {
      const resolved = resolveEnvRef(input, env);
      if (resolved === undefined) {
        const location =
          currentPath.length > 0 ? currentPath.join(".") : "<root>";
        throw new Error(
          `Unable to resolve env ref at "${location}": env "${input.env}" is not defined and no default was provided.`,
        );
      }

      return resolved;
    }

    if (Array.isArray(input)) {
      return input.map((item, index) =>
        resolve(item, [...currentPath, String(index)]),
      );
    }

    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>).map(
          ([key, nested]) => [key, resolve(nested, [...currentPath, key])],
        ),
      );
    }

    return input;
  };

  return resolve(value, path) as T;
}

function resolveThemeFlavors(theme: ThemeConfig | undefined): void {
  registerBuiltInFlavors();
  clearCustomFlavors();

  const customFlavors = theme?.flavors;
  if (!customFlavors) {
    return;
  }

  const resolving = new Set<string>();
  const resolved = new Set<string>();

  const resolveFlavor = (name: string): void => {
    if (resolved.has(name) || getFlavor(name)) {
      resolved.add(name);
      return;
    }

    const declaration = customFlavors[name];
    if (!declaration) {
      return;
    }

    if (resolving.has(name)) {
      const cycle = [...resolving, name].join(" -> ");
      throw new Error(`Circular flavor extension: ${cycle}`);
    }

    resolving.add(name);
    resolveFlavor(declaration.extends);
    resolving.delete(name);

    const { extends: parentName, ...overrides } = declaration;
    defineFlavorWithExtension(name, parentName, overrides);
    resolved.add(name);
  };

  for (const name of Object.keys(customFlavors)) {
    resolveFlavor(name);
  }
}

function resolveWorkflowMap(
  manifestWorkflows: ManifestConfig["workflows"],
): WorkflowMap {
  const result: WorkflowMap = {};
  for (const [name, definition] of Object.entries(manifestWorkflows ?? {})) {
    if (name === "actions") {
      continue;
    }

    result[name] = definition as WorkflowDefinition;
  }

  return result;
}

function isWorkflowNodeObject(value: unknown): value is {
  type: string;
  [key: string]: unknown;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as Record<string, unknown>).type === "string"
  );
}

function collectWorkflowDefinitions(
  manifest: EnvResolvedManifest,
): Array<{ location: string; definition: WorkflowDefinition }> {
  const result: Array<{ location: string; definition: WorkflowDefinition }> = [];

  for (const [name, definition] of Object.entries(manifest.workflows ?? {})) {
    if (name === "actions") {
      continue;
    }

    result.push({ location: `workflows.${name}`, definition });
  }

  for (const route of manifest.routes) {
    if (route.enter && typeof route.enter !== "string") {
      result.push({ location: `routes.${route.id}.enter`, definition: route.enter });
    }

    if (route.leave && typeof route.leave !== "string") {
      result.push({ location: `routes.${route.id}.leave`, definition: route.leave });
    }
  }

  for (const [name, overlay] of Object.entries(manifest.overlays ?? {})) {
    if (overlay.onOpen && typeof overlay.onOpen !== "string") {
      result.push({
        location: `overlays.${name}.onOpen`,
        definition: overlay.onOpen,
      });
    }

    if (overlay.onClose && typeof overlay.onClose !== "string") {
      result.push({
        location: `overlays.${name}.onClose`,
        definition: overlay.onClose,
      });
    }
  }

  return result;
}

function validateCustomWorkflowNode(
  node: Record<string, unknown>,
  location: string,
  declarations: CustomWorkflowActionDeclarationMap,
): void {
  const type = String(node.type);
  const declaration = declarations[type];
  if (!declaration) {
    throw new Error(
      `Workflow "${location}" references undeclared custom action "${type}". Add it to manifest.workflows.actions.custom.`,
    );
  }

  const allowedKeys = new Set(["type", "id", "when"]);
  for (const inputName of Object.keys(declaration.input ?? {})) {
    allowedKeys.add(inputName);
  }

  for (const key of Object.keys(node)) {
    if (!allowedKeys.has(key)) {
      throw new Error(
        `Custom workflow action "${type}" at "${location}" references undeclared input "${key}". Add it to manifest.workflows.actions.custom.${type}.input.`,
      );
    }
  }

  for (const [inputName, inputSchema] of Object.entries(
    declaration.input ?? {},
  )) {
    if (!(inputName in node)) {
      if (inputSchema.required) {
        throw new Error(
          `Custom workflow action "${type}" at "${location}" is missing required input "${inputName}".`,
        );
      }
      continue;
    }

    const value = node[inputName];
    switch (inputSchema.type) {
      case "string":
        if (typeof value !== "string") {
          throw new Error(
            `Custom workflow action "${type}" at "${location}" expected input "${inputName}" to be a string.`,
          );
        }
        break;
      case "number":
        if (typeof value !== "number") {
          throw new Error(
            `Custom workflow action "${type}" at "${location}" expected input "${inputName}" to be a number.`,
          );
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          throw new Error(
            `Custom workflow action "${type}" at "${location}" expected input "${inputName}" to be a boolean.`,
          );
        }
        break;
    }
  }
}

function validateWorkflowDefinition(
  definition: WorkflowDefinition,
  location: string,
  declarations: CustomWorkflowActionDeclarationMap,
): void {
  const nodes = Array.isArray(definition) ? definition : [definition];
  for (const [index, node] of nodes.entries()) {
    const nodeLocation = `${location}[${index}]`;

    if (!isWorkflowNodeObject(node)) {
      continue;
    }

    const { type } = node;
    if (
      !BUILTIN_WORKFLOW_NODE_TYPES.has(type) &&
      !Object.prototype.hasOwnProperty.call(declarations, type)
    ) {
      throw new Error(
        `Workflow "${nodeLocation}" references undeclared custom action "${type}". Add it to manifest.workflows.actions.custom.`,
      );
    }

    if (!BUILTIN_WORKFLOW_NODE_TYPES.has(type)) {
      validateCustomWorkflowNode(node, nodeLocation, declarations);
      continue;
    }

    switch (type) {
      case "if":
        validateWorkflowDefinition(
          node.then as WorkflowDefinition,
          `${nodeLocation}.then`,
          declarations,
        );
        if (node.else) {
          validateWorkflowDefinition(
            node.else as WorkflowDefinition,
            `${nodeLocation}.else`,
            declarations,
          );
        }
        break;
      case "parallel":
        for (const [branchIndex, branch] of (node.branches as WorkflowDefinition[]).entries()) {
          validateWorkflowDefinition(
            branch,
            `${nodeLocation}.branches[${branchIndex}]`,
            declarations,
          );
        }
        break;
      case "retry":
        validateWorkflowDefinition(
          node.step as WorkflowDefinition,
          `${nodeLocation}.step`,
          declarations,
        );
        if (node.onFailure) {
          validateWorkflowDefinition(
            node.onFailure as WorkflowDefinition,
            `${nodeLocation}.onFailure`,
            declarations,
          );
        }
        break;
      case "try":
        validateWorkflowDefinition(
          node.step as WorkflowDefinition,
          `${nodeLocation}.step`,
          declarations,
        );
        if (node.catch) {
          validateWorkflowDefinition(
            node.catch as WorkflowDefinition,
            `${nodeLocation}.catch`,
            declarations,
          );
        }
        if (node.finally) {
          validateWorkflowDefinition(
            node.finally as WorkflowDefinition,
            `${nodeLocation}.finally`,
            declarations,
          );
        }
        break;
    }
  }
}

function collectPolicyRefNames(value: unknown, refs = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectPolicyRefNames(item, refs);
    }
    return refs;
  }

  if (!value || typeof value !== "object") {
    return refs;
  }

  if (isPolicyRef(value)) {
    refs.add(value.policy);
    return refs;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    collectPolicyRefNames(nested, refs);
  }

  return refs;
}

function validatePolicyRefs(manifest: EnvResolvedManifest): void {
  const policyNames = new Set(Object.keys(manifest.policies ?? {}));
  const referencedPolicies = new Set<string>();
  for (const policy of Object.values(manifest.policies ?? {})) {
    for (const ref of collectPolicyRefs(policy)) {
      referencedPolicies.add(ref);
    }
  }

  for (const route of manifest.routes) {
    for (const ref of collectPolicyRefNames(route)) {
      referencedPolicies.add(ref);
    }
  }

  for (const overlay of Object.values(manifest.overlays ?? {})) {
    for (const ref of collectPolicyRefNames(overlay)) {
      referencedPolicies.add(ref);
    }
  }

  for (const policyName of referencedPolicies) {
    if (!policyNames.has(policyName)) {
      throw new Error(
        `Policy reference "${policyName}" does not exist. Add it to manifest.policies.`,
      );
    }
  }
}

function validateRouteSlots(route: RouteConfig): void {
  if (!route.slots) {
    return;
  }

  const declaredSlots = new Set<string>();
  for (const layout of route.layouts ?? []) {
    if (typeof layout === "string") {
      if (layout === "sidebar" || layout === "top-nav" || layout === "stacked") {
        declaredSlots.add("header");
        declaredSlots.add("sidebar");
        declaredSlots.add("main");
        declaredSlots.add("footer");
      }
      continue;
    }

    if (layout.type === "sidebar" || layout.type === "top-nav" || layout.type === "stacked") {
      declaredSlots.add("header");
      declaredSlots.add("sidebar");
      declaredSlots.add("main");
      declaredSlots.add("footer");
    }

    for (const slot of layout.slots ?? []) {
      declaredSlots.add(slot.name);
    }
  }

  if (declaredSlots.size === 0) {
    declaredSlots.add("main");
  }

  for (const slotName of Object.keys(route.slots)) {
    if (!declaredSlots.has(slotName)) {
      throw new Error(
        `Route "${route.id}" references undeclared slot "${slotName}". Available slots: ${[...declaredSlots].join(", ")}.`,
      );
    }
  }
}

function validateResourceClients(manifest: EnvResolvedManifest): void {
  const clients = new Set(["main", ...Object.keys(manifest.clients ?? {})]);

  for (const [resourceName, resource] of Object.entries(manifest.resources ?? {})) {
    if (!resource.client) {
      continue;
    }

    if (!clients.has(resource.client)) {
      throw new Error(
        `Resource "${resourceName}" references unknown client "${resource.client}". Add it to manifest.clients.`,
      );
    }
  }
}

function validateCustomClients(manifest: EnvResolvedManifest): void {
  for (const [name, client] of Object.entries(manifest.clients ?? {})) {
    if (!client.custom) {
      continue;
    }

    if (!getRegisteredClient(client.custom)) {
      throw new Error(
        `Manifest client "${name}" references unregistered custom client "${client.custom}". Register it before compiling the manifest.`,
      );
    }
  }
}

function buildCompiledManifest(
  manifest: ManifestConfig,
  env: Record<string, string | undefined>,
): CompiledManifest {
  const resolvedManifest = resolveManifestEnvRefs(
    manifest,
    env,
  ) as EnvResolvedManifest;
  const missingAuthScreens = getMissingAuthScreenIds(resolvedManifest);
  if (missingAuthScreens.length > 0) {
    const screen = missingAuthScreens[0];
    throw new Error(
      `Auth screen "${screen}" is enabled but no route has id "${screen}". Add { "id": "${screen}", "path": "/your-path", ... } to routes.`,
    );
  }

  resolveThemeFlavors(resolvedManifest.theme);
  validatePolicyRefs(resolvedManifest);
  validateCustomClients(resolvedManifest);
  validateResourceClients(resolvedManifest);

  const customActionDeclarations =
    (resolvedManifest.workflows as {
      actions?: { custom?: CustomWorkflowActionDeclarationMap };
    } | undefined)?.actions?.custom ?? {};
  setDeclaredCustomActionSchemas(customActionDeclarations);

  for (const { location, definition } of collectWorkflowDefinitions(
    resolvedManifest,
  )) {
    validateWorkflowDefinition(definition, location, customActionDeclarations);
  }

  const workflowNames = new Set(
    Object.keys(resolveWorkflowMap(resolvedManifest.workflows)),
  );
  for (const [kind, workflow] of Object.entries(
    resolvedManifest.auth?.on ?? {},
  )) {
    if (!workflowNames.has(workflow)) {
      throw new Error(
        `Auth handler "${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
      );
    }
  }

  for (const [kind, workflow] of Object.entries(
    resolvedManifest.realtime?.ws?.on ?? {},
  )) {
    if (!workflowNames.has(workflow)) {
      throw new Error(
        `Realtime WS handler "${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
      );
    }
  }

  for (const [path, endpoint] of Object.entries(
    resolvedManifest.realtime?.sse?.endpoints ?? {},
  )) {
    for (const [kind, workflow] of Object.entries(endpoint.on ?? {})) {
      if (!workflowNames.has(workflow)) {
        throw new Error(
          `Realtime SSE handler "${path}.${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
        );
      }
    }
  }

  const routes: CompiledRoute[] = resolvedManifest.routes.map((route) => {
    validateRouteSlots(route);
    return {
      id: route.id,
      path: route.path,
      page: toPageConfig(route),
      preload: route.preload,
      refreshOnEnter: route.refreshOnEnter,
      invalidateOnLeave: route.invalidateOnLeave,
      enter: route.enter,
      leave: route.leave,
      guard: route.guard,
    };
  });

  const routeMap = Object.fromEntries(
    routes.map((route) => [route.path, route]),
  ) as Record<string, CompiledRoute>;

  const auth = resolvedManifest.auth
    ? {
        ...resolvedManifest.auth,
        session: resolvedManifest.auth.session ?? {
          mode: "cookie" as const,
          storage: "sessionStorage" as const,
          key: "snapshot.token",
        },
      }
    : undefined;

  return {
    raw: resolvedManifest,
    app: {
      apiUrl: resolvedManifest.app?.apiUrl,
      shell: resolvedManifest.app?.shell ?? "full-width",
      title: resolvedManifest.app?.title,
      cache: {
        staleTime: resolvedManifest.app?.cache?.staleTime ?? 5 * 60 * 1000,
        gcTime: resolvedManifest.app?.cache?.gcTime ?? 10 * 60 * 1000,
        retry: resolvedManifest.app?.cache?.retry ?? 1,
      },
      home: resolvedManifest.app?.home ?? routes[0]?.path,
      loading: resolvedManifest.app?.loading,
      error: resolvedManifest.app?.error,
      notFound: resolvedManifest.app?.notFound,
      offline: resolvedManifest.app?.offline,
    },
    toast: resolvedManifest.toast,
    analytics: resolvedManifest.analytics,
    push: resolvedManifest.push,
    theme: resolvedManifest.theme,
    state: resolvedManifest.state,
    resources: resolvedManifest.resources,
    workflows: resolveWorkflowMap(resolvedManifest.workflows),
    overlays: resolvedManifest.overlays,
    navigation: resolvedManifest.navigation,
    auth,
    realtime: resolvedManifest.realtime,
    routes,
    routeMap,
    firstRoute: routes[0] ?? null,
  };
}

/**
 * Define a manifest without compiling it.
 *
 * @param manifest - Manifest object to return unchanged
 * @returns The same manifest object, typed as `ManifestConfig`
 */
export function defineManifest<TManifest extends ManifestConfig>(
  manifest: TManifest,
): TManifest {
  return manifest;
}

/**
 * Parse an unknown value into a validated manifest.
 *
 * @param manifest - Unknown input value
 * @returns The parsed manifest
 */
export function parseManifest(manifest: unknown): ManifestConfig {
  return withManifestCustomComponents(manifest, () =>
    manifestConfigSchema.parse(manifest),
  );
}

/**
 * Parse an unknown value into a validated manifest without throwing.
 *
 * @param manifest - Unknown input value
 * @returns A Zod safe-parse result for the manifest
 */
export function safeParseManifest(
  manifest: unknown,
): SafeParseReturnType<unknown, ManifestConfig> {
  return withManifestCustomComponents(manifest, () =>
    manifestConfigSchema.safeParse(manifest),
  );
}

/**
 * Parse and compile a manifest into the runtime shape.
 *
 * @param manifest - Manifest JSON or object
 * @returns The compiled manifest runtime model
 */
export function compileManifest(manifest: unknown): CompiledManifest {
  return buildCompiledManifest(parseManifest(manifest), getDefaultEnvSource());
}

/**
 * Parse and compile a manifest into the runtime shape using a custom env source.
 *
 * @param manifest - Manifest JSON or object
 * @param env - Environment source used to resolve `{ env: "..." }` values
 * @returns The compiled manifest runtime model
 */
export function compileManifestWithEnv(
  manifest: unknown,
  env: Record<string, string | undefined>,
): CompiledManifest {
  return buildCompiledManifest(parseManifest(manifest), env);
}

/**
 * Parse and compile a manifest without throwing.
 *
 * @param manifest - Manifest JSON or object
 * @returns The parsed manifest and compiled runtime model, or validation errors
 */
export function safeCompileManifest(manifest: unknown):
  | { success: true; manifest: ManifestConfig; compiled: CompiledManifest }
  | {
      success: false;
      error: ZodError<unknown>;
    } {
  const parsed = safeParseManifest(manifest);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error,
    };
  }

  return {
    success: true,
    manifest: parsed.data,
    compiled: buildCompiledManifest(parsed.data, getDefaultEnvSource()),
  };
}
