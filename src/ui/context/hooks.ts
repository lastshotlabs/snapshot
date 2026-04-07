import { useCallback, useContext, useEffect, useRef } from "react";
import { atom } from "jotai";
import { useAtomValue } from "jotai/react";
import type { PrimitiveAtom } from "jotai";
import { PageRegistryContext, AppRegistryContext } from "./providers";
import {
  getNestedValue,
  isFromRef,
  extractFromRefs,
  applyResolved,
} from "./utils";
import type { FromRef, ResolvedConfig } from "./types";

/** Fallback atom used when the source atom doesn't exist yet. */
const UNDEFINED_ATOM = atom<unknown>(undefined);

/**
 * Registers a component in the page context and returns a setter function
 * to publish values that other components can subscribe to via `{ from: "id" }`.
 *
 * The atom is registered on first render and unregistered when the component unmounts,
 * ensuring cleanup when the page changes.
 *
 * @param id - The component id used as the publish key
 * @returns A stable setter function that updates the published value
 *
 * @example
 * ```tsx
 * function MyTable() {
 *   const publish = usePublish('users-table')
 *
 *   const handleRowSelect = (row) => {
 *     publish({ selected: row })
 *   }
 *
 *   return <table onClick={handleRowSelect}>...</table>
 * }
 * ```
 */
export function usePublish(id: string): (value: unknown) => void {
  const pageRegistry = useContext(PageRegistryContext);

  // Register atom on mount, unregister on unmount
  const atomRef = useRef<PrimitiveAtom<unknown> | undefined>(undefined);
  if (!atomRef.current && pageRegistry) {
    atomRef.current = pageRegistry.register(id);
  }

  useEffect(() => {
    return () => {
      if (pageRegistry) pageRegistry.unregister(id);
      atomRef.current = undefined;
    };
  }, [id, pageRegistry]);

  return useCallback(
    (value: unknown) => {
      if (atomRef.current && pageRegistry) {
        pageRegistry.store.set(atomRef.current, value);
      }
    },
    [pageRegistry],
  );
}

/**
 * Subscribes to a value from the context system.
 *
 * - If the value is a `FromRef` (`{ from: "id" }`), resolves it from the page or app context
 * - If the ref starts with `"global."`, reads from AppContext instead of PageContext
 * - Dot-paths after the component id access nested fields
 * - Static values (strings, numbers, etc.) pass through unchanged
 *
 * Returns undefined if the source component hasn't mounted yet.
 *
 * @param ref - A FromRef to resolve, or a static value to pass through
 * @returns The resolved value, or the static value unchanged
 *
 * @example
 * ```tsx
 * // Subscribe to a page-level component
 * const selected = useSubscribe({ from: 'users-table.selected' })
 *
 * // Subscribe to a global value
 * const user = useSubscribe({ from: 'global.user' })
 *
 * // Static passthrough
 * const label = useSubscribe('Hello') // → 'Hello'
 * ```
 */
export function useSubscribe(ref: FromRef | unknown): unknown {
  // Static values pass through
  const isRef = isFromRef(ref);

  const refPath = isRef ? ref.from : "";
  const isGlobal = refPath.startsWith("global.");
  const cleanPath = isGlobal ? refPath.slice(7) : refPath;

  // Split component id from sub-path: "users-table.selected.id" → ["users-table", "selected.id"]
  const dotIndex = cleanPath.indexOf(".");
  const componentId =
    dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);
  const subPath = dotIndex === -1 ? "" : cleanPath.slice(dotIndex + 1);

  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const registry = isGlobal ? appRegistry : pageRegistry;
  const sourceAtom = isRef ? registry?.get(componentId) : undefined;

  // If atom doesn't exist yet, use a fallback that returns undefined
  const value = useAtomValue(sourceAtom ?? UNDEFINED_ATOM, {
    store: registry?.store,
  });

  if (!isRef) return ref;

  return subPath ? getNestedValue(value, subPath) : value;
}

/**
 * Resolves all `FromRef` values in a config object at once.
 * Static values pass through unchanged. Returns a new object with
 * all refs replaced by their current values.
 *
 * @param config - A config object that may contain FromRef values at any depth
 * @returns A new object with all FromRefs replaced by resolved values
 *
 * @example
 * ```tsx
 * const resolved = useResolveFrom({
 *   userId: { from: 'users-table.selected.id' },
 *   period: { from: 'date-range' },
 *   label: 'static label',
 * })
 * // → { userId: 5, period: '30d', label: 'static label' }
 * ```
 */
export function useResolveFrom<T extends Record<string, unknown>>(
  config: T,
): ResolvedConfig<T> {
  // Collect all FromRef paths from the config
  const refs = extractFromRefs(config);
  // Subscribe to each one (hooks are called in consistent order since refs are derived from config shape)
  const resolved = new Map<string, unknown>();
  for (const [path, fromRef] of refs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolved.set(path, useSubscribe(fromRef));
  }
  // Return config with FromRefs replaced by resolved values
  return applyResolved(config, resolved) as ResolvedConfig<T>;
}
