import { interpolate } from "../actions/interpolate";
import type { CompiledManifest, CompiledRoute } from "./types";

export function normalizePathname(path: string): string {
  if (!path) {
    return "/";
  }

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

export function matchRoutePath(
  routePath: string,
  currentPath: string,
): Record<string, string> | null {
  const patternParts = normalizePathname(routePath).split("/").filter(Boolean);
  const currentParts = normalizePathname(currentPath).split("/").filter(Boolean);

  if (patternParts.length !== currentParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i]!;
    const currentPart = currentParts[i]!;
    const paramMatch = patternPart.match(/^\{(.+)\}$/);
    if (paramMatch) {
      params[paramMatch[1]!] = decodeURIComponent(currentPart);
      continue;
    }

    if (patternPart !== currentPart) {
      return null;
    }
  }

  return params;
}

export function resolveRouteMatch(
  manifest: CompiledManifest,
  currentPath: string,
): { route: CompiledRoute | null; params: Record<string, string> } {
  const normalizedCurrentPath = normalizePathname(currentPath);
  const exactRoute = manifest.routeMap[normalizedCurrentPath];
  if (exactRoute) {
    return { route: exactRoute, params: {} };
  }

  for (const route of manifest.routes) {
    const params = matchRoutePath(route.path, normalizedCurrentPath);
    if (params) {
      return { route, params };
    }
  }

  if (manifest.app.notFound) {
    const notFoundRoute =
      manifest.routeMap[normalizePathname(manifest.app.notFound)];
    if (notFoundRoute) {
      return { route: notFoundRoute, params: {} };
    }
  }

  if (manifest.app.home) {
    const homeRoute = manifest.routeMap[normalizePathname(manifest.app.home)];
    if (homeRoute) {
      return { route: homeRoute, params: {} };
    }
  }

  if (manifest.firstRoute) {
    return { route: manifest.firstRoute, params: {} };
  }

  return { route: null, params: {} };
}

export function resolveDocumentTitle(
  manifest: CompiledManifest,
  route: CompiledRoute | null,
  currentPath: string,
  params: Record<string, string>,
): string {
  const appTitle = manifest.app.title?.trim();
  const routeTitle = route?.page.title
    ? interpolate(route.page.title, {
        params,
        route: {
          id: route.id,
          path: currentPath,
          pattern: route.path,
        },
      }).trim()
    : "";

  if (routeTitle && appTitle) {
    return `${routeTitle} | ${appTitle}`;
  }

  return routeTitle || appTitle || "";
}
