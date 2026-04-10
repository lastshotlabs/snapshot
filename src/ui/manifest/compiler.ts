import type { SafeParseReturnType, ZodError } from "zod";
import { getMissingAuthScreenIds } from "./auth-routes";
import { getDefaultEnvSource, isEnvRef, resolveEnvRef } from "./env";
import { manifestConfigSchema, withManifestCustomComponents } from "./schema";
import type {
  AppConfig,
  AuthScreenConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  PageConfig,
  RouteConfig,
} from "./types";

type EnvResolvedManifest = Omit<ManifestConfig, "app" | "auth" | "routes"> & {
  app?: AppConfig;
  auth?: AuthScreenConfig;
  routes: RouteConfig[];
};

function toPageConfig(route: RouteConfig): PageConfig {
  return {
    layout: route.layout,
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

  const workflowNames = new Set(Object.keys(resolvedManifest.workflows ?? {}));
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

  const routes: CompiledRoute[] = resolvedManifest.routes.map((route) => ({
    id: route.id,
    path: route.path,
    page: toPageConfig(route),
    preload: route.preload,
    refreshOnEnter: route.refreshOnEnter,
    invalidateOnLeave: route.invalidateOnLeave,
    enter: route.enter,
    leave: route.leave,
    guard: route.guard,
  }));

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
    theme: resolvedManifest.theme,
    state: resolvedManifest.state,
    resources: resolvedManifest.resources,
    workflows: resolvedManifest.workflows,
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
