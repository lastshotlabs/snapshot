import type { FromRef } from "./types";

/**
 * Safely access nested values via dot-path.
 * Returns undefined if any segment along the path is null/undefined.
 *
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g. "selected.name")
 * @returns The value at the path, or undefined if unreachable
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Type guard for FromRef values.
 * A FromRef is an object with a single `from` string property.
 *
 * @param value - The value to check
 * @returns True if the value is a FromRef
 */
export function isFromRef(value: unknown): value is FromRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "from" in value &&
    typeof (value as FromRef).from === "string"
  );
}

/**
 * Parse a data string like "GET /api/users" into [method, endpoint].
 * If no method is specified, defaults to "GET".
 *
 * @param data - Data string in the format "METHOD /path" or just "/path"
 * @returns Tuple of [method, endpoint]
 */
export function parseDataString(data: string): [string, string] {
  const spaceIndex = data.indexOf(" ");
  if (spaceIndex === -1) return ["GET", data];
  return [data.slice(0, spaceIndex), data.slice(spaceIndex + 1)];
}

/**
 * Extract all FromRef values from a nested config object with their dot-paths.
 * Recursively traverses objects and arrays to find all FromRef values.
 *
 * @param obj - The config object to search
 * @param prefix - Internal prefix for building dot-paths (used in recursion)
 * @returns Map of dot-path to FromRef
 */
export function extractFromRefs(
  obj: unknown,
  prefix = "",
): Map<string, FromRef> {
  const result = new Map<string, FromRef>();

  if (obj == null || typeof obj !== "object") return result;

  if (isFromRef(obj)) {
    result.set(prefix, obj);
    return result;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const childPath = prefix ? `${prefix}.${i}` : `${i}`;
      const childRefs = extractFromRefs(obj[i], childPath);
      for (const [k, v] of childRefs) {
        result.set(k, v);
      }
    }
    return result;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    const childRefs = extractFromRefs(value, childPath);
    for (const [k, v] of childRefs) {
      result.set(k, v);
    }
  }

  return result;
}

/**
 * Apply resolved values back into a config object, replacing FromRefs with their resolved values.
 * Creates a shallow clone at each level where replacements occur.
 *
 * @param config - The original config object containing FromRefs
 * @param resolved - Map of dot-path to resolved value
 * @returns New config object with FromRefs replaced
 */
export function applyResolved<T>(config: T, resolved: Map<string, unknown>): T {
  return applyResolvedInternal(config, resolved, "") as T;
}

function applyResolvedInternal(
  obj: unknown,
  resolved: Map<string, unknown>,
  prefix: string,
): unknown {
  if (obj == null || typeof obj !== "object") return obj;

  if (isFromRef(obj) && resolved.has(prefix)) {
    return resolved.get(prefix);
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => {
      const childPath = prefix ? `${prefix}.${i}` : `${i}`;
      return applyResolvedInternal(item, resolved, childPath);
    });
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    result[key] = applyResolvedInternal(value, resolved, childPath);
  }
  return result;
}
