import type { SafeParseReturnType, ZodError } from "zod";
import { manifestConfigSchema } from "./schema";
import type {
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  PageConfig,
  RouteConfig,
} from "./types";

function toPageConfig(route: RouteConfig): PageConfig {
  return {
    layout: route.layout,
    title: route.title,
    content: route.content,
    roles: route.roles,
    breadcrumb: route.breadcrumb,
  };
}

function buildCompiledManifest(manifest: ManifestConfig): CompiledManifest {
  const routes: CompiledRoute[] = manifest.routes.map((route) => ({
    id: route.id,
    path: route.path,
    page: toPageConfig(route),
  }));

  const routeMap = Object.fromEntries(
    routes.map((route) => [route.path, route]),
  ) as Record<string, CompiledRoute>;

  return {
    raw: manifest,
    app: {
      shell: manifest.app?.shell,
      title: manifest.app?.title,
      home: manifest.app?.home ?? routes[0]?.path,
      notFound: manifest.app?.notFound,
    },
    theme: manifest.theme,
    state: manifest.state,
    resources: manifest.resources,
    workflows: manifest.workflows,
    navigation: manifest.navigation,
    auth: manifest.auth,
    routes,
    routeMap,
    firstRoute: routes[0] ?? null,
  };
}

export function defineManifest<TManifest extends ManifestConfig>(
  manifest: TManifest,
): TManifest {
  return manifest;
}

export function parseManifest(manifest: unknown): ManifestConfig {
  return manifestConfigSchema.parse(manifest);
}

export function safeParseManifest(
  manifest: unknown,
): SafeParseReturnType<unknown, ManifestConfig> {
  return manifestConfigSchema.safeParse(manifest);
}

export function compileManifest(manifest: unknown): CompiledManifest {
  return buildCompiledManifest(parseManifest(manifest));
}

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
    compiled: buildCompiledManifest(parsed.data),
  };
}
