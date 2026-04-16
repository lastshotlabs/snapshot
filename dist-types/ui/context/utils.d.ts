import { isFromRef as isSharedFromRef } from "@lastshotlabs/frontend-contract/refs";
import type { FromRef } from "./types";
export declare const isFromRef: typeof isSharedFromRef;
/**
 * Safely access nested values via dot-path.
 * Returns undefined if any segment along the path is null/undefined.
 *
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g. "selected.name")
 * @returns The value at the path, or undefined if unreachable
 */
export declare function getNestedValue(obj: unknown, path: string): unknown;
/**
 * Parse a data string like "GET /api/users" into [method, endpoint].
 * If no method is specified, defaults to "GET".
 *
 * @param data - Data string in the format "METHOD /path" or just "/path"
 * @returns Tuple of [method, endpoint]
 */
export declare function parseDataString(data: string): [string, string];
/**
 * Extract all FromRef values from a nested config object with their dot-paths.
 * Recursively traverses objects and arrays to find all FromRef values.
 *
 * @param obj - The config object to search
 * @param prefix - Internal prefix for building dot-paths (used in recursion)
 * @returns Map of dot-path to FromRef
 */
export declare function extractFromRefs(obj: unknown, prefix?: string): Map<string, FromRef>;
/**
 * Applies a named transform to a resolved value.
 * Used by the FromRef system to post-process values after resolution.
 *
 * @param value - The resolved value to transform
 * @param transform - The transform name (e.g. "uppercase", "first", "default")
 * @param arg - Optional argument for transforms that accept one (e.g. join separator)
 * @returns The transformed value, or the original value if no transform is specified
 */
export declare function applyTransform(value: unknown, transform?: string, arg?: string | number): unknown;
/**
 * Apply resolved values back into a config object, replacing FromRefs with their resolved values.
 * Creates a shallow clone at each level where replacements occur.
 *
 * @param config - The original config object containing FromRefs
 * @param resolved - Map of dot-path to resolved value
 * @returns New config object with FromRefs replaced
 */
export declare function applyResolved<T>(config: T, resolved: Map<string, unknown>): T;
