import type { CompiledManifest, CompiledRoute, RouteMatch } from "./types";
export declare function normalizePathname(path: string): string;
export declare function matchRoutePath(routePath: string, currentPath: string): Record<string, string> | null;
export declare function resolveRouteMatch(manifest: CompiledManifest, currentPath: string): RouteMatch;
export declare function resolveDocumentTitle(manifest: CompiledManifest, route: CompiledRoute | null, currentPath: string, params: Record<string, string>, locale?: string): string;
