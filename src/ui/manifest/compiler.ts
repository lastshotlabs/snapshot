import { ZodError, type SafeParseReturnType } from "zod";
import { ACTION_TYPES } from "../actions/types";
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
import { buildDefaultAuthFragment } from "./defaults/auth";
import { defaultFeedbackFragment } from "./defaults/feedback";
import { expandPreset } from "../presets/expand";
import { resolveGuard } from "./guard-registry";
import { mergeFragment } from "./merge";
import { setDeclaredCustomActionSchemas } from "../workflows/registry";
import { mergeContract } from "../../auth/contract";
import type {
  AppConfig,
  AnalyticsConfig,
  AuthScreenConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  ParsedManifestConfig,
  PageConfig,
  PushConfig,
  RealtimeConfig,
  ToastConfig,
  RouteConfig,
} from "./types";
import type {
  CustomWorkflowActionDeclarationMap,
  WorkflowDefinition,
  WorkflowMap,
} from "../workflows/types";
import type { ThemeConfig } from "../tokens/types";
import { bootBuiltins } from "./boot-builtins";

type EnvResolvedManifest = Omit<
  ParsedManifestConfig,
  "app" | "auth" | "routes" | "analytics" | "push" | "realtime" | "toast"
> & {
  app?: AppConfig;
  analytics?: AnalyticsConfig;
  auth?: AuthScreenConfig;
  push?: PushConfig;
  realtime?: RealtimeConfig;
  toast?: ToastConfig;
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
  if (!route.content) {
    throw new Error(
      `Route "${route.id}" is missing content after compilation. Routes using presets must expand to a valid page config.`,
    );
  }

  return {
    title: route.title,
    content: route.content,
    roles: route.roles,
    breadcrumb: route.breadcrumb,
  };
}

function expandRoutePresets(routes: RouteConfig[]): RouteConfig[] {
  return routes.map((route) => {
    const nextRoute = route.preset
      ? (() => {
          const expanded = expandPreset(route.preset, route.presetConfig ?? {});
          return {
            ...route,
            title: route.title ?? expanded.title,
            content: expanded.content,
            preset: undefined,
            presetConfig: undefined,
          };
        })()
      : route;

    if (!nextRoute.children?.length) {
      return nextRoute;
    }

    return {
      ...nextRoute,
      children: expandRoutePresets(nextRoute.children),
    };
  });
}

function normalizeCompiledRouteSegment(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const trimmed = path.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function joinCompiledRoutePath(parentPath: string, childPath: string): string {
  const normalizedParent = normalizeCompiledRouteSegment(parentPath);
  const normalizedChild = normalizeCompiledRouteSegment(childPath);

  if (normalizedParent === "/") {
    return normalizedChild;
  }

  if (normalizedChild === "/") {
    return normalizedParent;
  }

  return `${normalizedParent}${normalizedChild}`.replace(/\/{2,}/g, "/");
}

function walkRoutes<T>(
  routes: RouteConfig[],
  visit: (
    route: RouteConfig,
    fullPath: string,
    parent?: RouteConfig,
    parentPath?: string,
  ) => T,
  parentPath = "",
  parentRoute?: RouteConfig,
): T[] {
  const results: T[] = [];

  for (const route of routes) {
    const fullPath =
      parentPath.length === 0
        ? normalizeCompiledRouteSegment(route.path)
        : joinCompiledRoutePath(parentPath, route.path);
    results.push(visit(route, fullPath, parentRoute, parentPath || undefined));

    if (route.children?.length) {
      results.push(...walkRoutes(route.children, visit, fullPath, route));
    }
  }

  return results;
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
  manifestWorkflows: ParsedManifestConfig["workflows"],
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
  const result: Array<{ location: string; definition: WorkflowDefinition }> =
    [];

  for (const [name, definition] of Object.entries(manifest.workflows ?? {})) {
    if (name === "actions") {
      continue;
    }

    result.push({
      location: `workflows.${name}`,
      definition: definition as WorkflowDefinition,
    });
  }

  for (const definitions of walkRoutes(manifest.routes, (candidate) => {
    const nestedDefinitions: Array<{
      location: string;
      definition: WorkflowDefinition;
    }> = [];

    if (candidate.enter && typeof candidate.enter !== "string") {
      nestedDefinitions.push({
        location: `routes.${candidate.id}.enter`,
        definition: candidate.enter,
      });
    }

    if (candidate.leave && typeof candidate.leave !== "string") {
      nestedDefinitions.push({
        location: `routes.${candidate.id}.leave`,
        definition: candidate.leave,
      });
    }

    return nestedDefinitions;
  })) {
    result.push(...definitions);
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
        for (const [branchIndex, branch] of (
          node.branches as WorkflowDefinition[]
        ).entries()) {
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

function collectPolicyRefNames(
  value: unknown,
  refs = new Set<string>(),
): Set<string> {
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

  for (const candidate of walkRoutes(manifest.routes, (routeValue) => routeValue)) {
    for (const ref of collectPolicyRefNames(candidate)) {
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
      if (
        layout === "sidebar" ||
        layout === "top-nav" ||
        layout === "stacked"
      ) {
        declaredSlots.add("nav");
        declaredSlots.add("header");
        declaredSlots.add("sidebar");
        declaredSlots.add("main");
        declaredSlots.add("footer");
      }
      continue;
    }

    if (
      layout.type === "sidebar" ||
      layout.type === "top-nav" ||
      layout.type === "stacked"
    ) {
      declaredSlots.add("nav");
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
    declaredSlots.add("nav");
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

  for (const [resourceName, resource] of Object.entries(
    manifest.resources ?? {},
  )) {
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

function validateRegisteredGuards(manifest: EnvResolvedManifest): void {
  for (const candidate of walkRoutes(manifest.routes, (routeValue) => routeValue)) {
    const guardName =
      typeof candidate.guard === "string"
        ? candidate.guard
        : candidate.guard?.name;
    if (!guardName) {
      continue;
    }

    if (!resolveGuard(guardName)) {
      throw new Error(
        `Route "${candidate.id}" references unknown guard "${guardName}". Register it before compiling the manifest.`,
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
  manifest: ParsedManifestConfig,
  env: Record<string, string | undefined>,
): CompiledManifest {
  bootBuiltins();
  const resolvedManifest = resolveManifestEnvRefs(
    manifest,
    env,
  ) as EnvResolvedManifest;
  resolvedManifest.routes = expandRoutePresets(resolvedManifest.routes);
  const mergedManifest = mergeFragment(
    mergeFragment(resolvedManifest, defaultFeedbackFragment),
    buildDefaultAuthFragment(resolvedManifest),
  ) as EnvResolvedManifest;

  const runtimeManifest = mergedManifest;

  resolveThemeFlavors(runtimeManifest.theme);
  validatePolicyRefs(runtimeManifest);
  validateCustomClients(runtimeManifest);
  validateResourceClients(runtimeManifest);
  validateRegisteredGuards(runtimeManifest);

  const customActionDeclarations =
    (
    runtimeManifest.workflows as
        | {
            actions?: { custom?: CustomWorkflowActionDeclarationMap };
          }
        | undefined
    )?.actions?.custom ?? {};
  setDeclaredCustomActionSchemas(customActionDeclarations);

  for (const { location, definition } of collectWorkflowDefinitions(
    runtimeManifest,
  )) {
    validateWorkflowDefinition(definition, location, customActionDeclarations);
  }

  const workflowNames = new Set(
    Object.keys(resolveWorkflowMap(runtimeManifest.workflows)),
  );
  for (const [kind, workflow] of Object.entries(
    runtimeManifest.auth?.on ?? {},
  )) {
    if (!workflowNames.has(workflow)) {
      throw new Error(
        `Auth handler "${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
      );
    }
  }

  for (const [kind, workflow] of Object.entries(
    runtimeManifest.realtime?.ws?.on ?? {},
  )) {
    if (!workflowNames.has(workflow)) {
      throw new Error(
        `Realtime WS handler "${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
      );
    }
  }

  for (const [path, endpoint] of Object.entries(
    runtimeManifest.realtime?.sse?.endpoints ?? {},
  )) {
    for (const [kind, workflow] of Object.entries(endpoint.on ?? {})) {
      if (!workflowNames.has(workflow)) {
        throw new Error(
          `Realtime SSE handler "${path}.${kind}" references missing workflow "${workflow}". Add it to manifest.workflows.`,
        );
      }
    }
  }

  const routes = walkRoutes(
    runtimeManifest.routes,
    (route, fullPath, parentRoute, parentPath): CompiledRoute => {
      validateRouteSlots(route);
      return {
        id: route.id,
        path: fullPath,
        parentId: parentRoute?.id ?? null,
        parentPath: parentPath ?? null,
        page: toPageConfig(route),
        preload: route.preload,
        prefetch: route.prefetch,
        refreshOnEnter: route.refreshOnEnter,
        invalidateOnLeave: route.invalidateOnLeave,
        enter: route.enter,
        leave: route.leave,
        guard: route.guard,
        events: route.events,
        transition: route.transition,
      };
    },
  );

  const routeMap = Object.fromEntries(
    routes.map((route) => [route.path, route]),
  ) as Record<string, CompiledRoute>;

  const auth = runtimeManifest.auth
    ? {
        ...runtimeManifest.auth,
        contract: mergeContract(
          runtimeManifest.app?.apiUrl ?? "",
          runtimeManifest.auth.contract as Parameters<typeof mergeContract>[1],
        ),
        session: runtimeManifest.auth.session ?? {
          mode: "cookie" as const,
          storage: "sessionStorage" as const,
          key: "snapshot.token",
        },
      }
    : undefined;

  return {
    raw: runtimeManifest,
    app: {
      apiUrl: runtimeManifest.app?.apiUrl,
      shell: runtimeManifest.app?.shell ?? "full-width",
      title: runtimeManifest.app?.title,
      headers: runtimeManifest.app?.headers,
      cache: {
        staleTime: runtimeManifest.app?.cache?.staleTime ?? 5 * 60 * 1000,
        gcTime: runtimeManifest.app?.cache?.gcTime ?? 10 * 60 * 1000,
        retry: runtimeManifest.app?.cache?.retry ?? 1,
      },
      home: runtimeManifest.app?.home ?? routes[0]?.path,
      loading: runtimeManifest.app?.loading,
      error: runtimeManifest.app?.error,
      notFound: runtimeManifest.app?.notFound,
      offline: runtimeManifest.app?.offline,
      breadcrumbs: runtimeManifest.app?.breadcrumbs,
      a11y: runtimeManifest.app?.a11y,
    },
    toast: runtimeManifest.toast,
    analytics: runtimeManifest.analytics,
    observability: runtimeManifest.observability,
    push: runtimeManifest.push,
    theme: runtimeManifest.theme,
    state: runtimeManifest.state,
    resources: runtimeManifest.resources,
    workflows: resolveWorkflowMap(runtimeManifest.workflows),
    overlays: runtimeManifest.overlays,
    navigation: runtimeManifest.navigation,
    auth,
    realtime: runtimeManifest.realtime,
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
export function parseManifest(manifest: unknown): ParsedManifestConfig {
  bootBuiltins();
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
): SafeParseReturnType<unknown, ParsedManifestConfig> {
  bootBuiltins();
  return withManifestCustomComponents(manifest, () =>
    manifestConfigSchema.safeParse(manifest),
  );
}

/**
 * Parse and compile a manifest into the runtime shape.
 *
 * @param manifest - Manifest JSON or object
 * @param options - Compile options
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
 * @param options - Compile options
 * @returns The parsed manifest and compiled runtime model, or validation errors
 */
export function safeCompileManifest(manifest: unknown):
  | {
      success: true;
      manifest: ParsedManifestConfig;
      compiled: CompiledManifest;
    }
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

  try {
    return {
      success: true,
      manifest: parsed.data,
      compiled: buildCompiledManifest(parsed.data, getDefaultEnvSource()),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: new ZodError([
        {
          code: "custom",
          path: [],
          message:
            error instanceof Error ? error.message : "Manifest compilation failed",
        },
      ]),
    };
  }
}
