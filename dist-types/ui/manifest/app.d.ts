/**
 * ManifestApp — renders an entire application from a manifest config.
 */
import type { EndpointTarget } from "./resources";
import type { ManifestAppProps } from "./types";
/**
 * Inject or update a stylesheet in the document head.
 *
 * @param id - Stable style element id
 * @param css - CSS text to inject
 */
export declare function injectStyleSheet(id: string, css: string): void;
/**
 * Merge route preload params with explicit override params.
 *
 * @param target - Resource target or target descriptor
 * @param params - Route params to merge into the target
 * @returns The resolved preload target
 */
export declare function resolveRoutePreloadTarget(target: EndpointTarget, params: Record<string, string>): {
    target: EndpointTarget;
    params?: Record<string, unknown>;
};
/**
 * Render the manifest-driven application shell.
 *
 * @param props - Manifest runtime props
 * @returns A fully rendered manifest application
 */
export declare function ManifestApp({ manifest, apiUrl, lazyComponents, }: ManifestAppProps): import("react/jsx-runtime").JSX.Element | null;
