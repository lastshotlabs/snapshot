import type { ManifestConfig, RouteConfig } from "./types";

export type ManifestFragment = Partial<ManifestConfig>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T | undefined, override: T | undefined): T | undefined {
  if (base === undefined) {
    return override;
  }
  if (override === undefined) {
    return base;
  }
  if (!isRecord(base) || !isRecord(override)) {
    return override;
  }

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = deepMerge(result[key], value);
  }
  return result as T;
}

export function mergeFragment(
  base: ManifestConfig,
  fragment: ManifestFragment,
): ManifestConfig {
  const fragmentRoutes = fragment.routes ?? [];
  const baseRoutes = base.routes ?? [];
  const baseRouteIds = new Set(
    baseRoutes.map((route: RouteConfig) => route.id),
  );
  const fragmentRoutesById = new Map(
    fragmentRoutes.map((route: RouteConfig) => [route.id, route] as const),
  );
  const mergedBaseRoutes = baseRoutes.map((route: RouteConfig) => {
    const fragmentRoute = fragmentRoutesById.get(route.id);
    return fragmentRoute ? (deepMerge(fragmentRoute, route) ?? route) : route;
  });

  const fragmentI18n = fragment.i18n;
  const baseI18n = base.i18n;

  return {
    ...base,
    routes: [
      ...mergedBaseRoutes,
      ...fragmentRoutes.filter((route: RouteConfig) => !baseRouteIds.has(route.id)),
    ],
    theme: deepMerge(fragment.theme, base.theme),
    resources: { ...(fragment.resources ?? {}), ...(base.resources ?? {}) },
    state: { ...(fragment.state ?? {}), ...(base.state ?? {}) },
    overlays: { ...(fragment.overlays ?? {}), ...(base.overlays ?? {}) },
    workflows: { ...(fragment.workflows ?? {}), ...(base.workflows ?? {}) },
    i18n:
      fragmentI18n || baseI18n
        ? {
            ...(fragmentI18n ?? {}),
            ...(baseI18n ?? {}),
            default: baseI18n?.default ?? fragmentI18n?.default ?? "en",
            locales: [
              ...new Set([
                ...((fragmentI18n?.locales as string[] | undefined) ?? []),
                ...((baseI18n?.locales as string[] | undefined) ?? []),
              ]),
            ],
            strings: {
              ...((fragmentI18n?.strings ??
                {}) as NonNullable<
                NonNullable<ManifestConfig["i18n"]>["strings"]
              >),
              ...((baseI18n?.strings ??
                {}) as NonNullable<
                NonNullable<ManifestConfig["i18n"]>["strings"]
              >),
            },
          }
        : undefined,
  };
}
