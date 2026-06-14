import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { atom } from "jotai";
import { useAtomValue } from "jotai/react";
import type { PrimitiveAtom } from "jotai";
import { PageRegistryContext, AppRegistryContext } from "./providers";
import {
  evaluateExpression,
  extractExpressionRefs,
} from "../expressions/parser";
import {
  getNestedValue,
  isFromRef,
  extractFromRefs,
  applyResolved,
  applyTransform,
} from "./utils";
import type { ExprRef, FromRef, ResolvedConfig } from "./types";
import type { AtomRegistry } from "../state/types";

/** Fallback atom used when the source atom doesn't exist yet. */
const UNDEFINED_ATOM = atom<unknown>(undefined);

type RouteBindingContext = {
  currentRoute?: { id?: string; path?: string };
  currentPath?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
} | null;

type OverlayBindingContext = {
  id?: string;
  kind?: string;
  payload?: unknown;
  result?: unknown;
} | null;

function useRouteBindingContext(): RouteBindingContext {
  return null;
}

function useOverlayBindingContext(): OverlayBindingContext {
  return null;
}

function isExprRef(value: unknown): value is ExprRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "expr" in value &&
    typeof (value as ExprRef).expr === "string"
  );
}

function resolveSubscriptionTarget(
  refPath: string,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
): {
  registry: AtomRegistry | null;
  cleanPath: string;
} {
  if (refPath.startsWith("global.")) {
    return {
      registry: appRegistry,
      cleanPath: refPath.slice(7),
    };
  }

  if (refPath.startsWith("state.")) {
    const cleanPath = refPath.slice(6);
    const dotIndex = cleanPath.indexOf(".");
    const stateId = dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);

    return {
      registry:
        pageRegistry?.get(stateId) != null
          ? pageRegistry
          : appRegistry?.get(stateId) != null
            ? appRegistry
            : (pageRegistry ?? appRegistry),
      cleanPath,
    };
  }

  return {
    registry: pageRegistry,
    cleanPath: refPath,
  };
}

/**
 * Registers a component in the page context and returns a setter function
 * to publish values that other components can subscribe to via `{ from: "id" }`.
 */
export function usePublish(id: string | undefined): (value: unknown) => void {
  const pageRegistry = useContext(PageRegistryContext);

  const atomRef = useRef<PrimitiveAtom<unknown> | undefined>(undefined);
  if (!atomRef.current && pageRegistry && id) {
    atomRef.current = pageRegistry.register(id);
  }

  useEffect(() => {
    return () => {
      if (pageRegistry && id) {
        pageRegistry.unregister(id);
      }
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
 * Subscribes to a value from the shared binding/state registry system.
 */
export function useSubscribe(ref: FromRef | unknown): unknown {
  const isRef = isFromRef(ref);
  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const overlayRuntime = useOverlayBindingContext();
  const routeRuntime = useRouteBindingContext();
  const refPath = isRef ? ref.from : "";

  if (isRef && refPath.startsWith("params.")) {
    const resolved = getNestedValue(routeRuntime?.params, refPath.slice(7));
    return applyTransform(
      resolved,
      (ref as FromRef).transform,
      (ref as FromRef).transformArg,
    );
  }

  if (isRef && refPath.startsWith("route.")) {
    const routeValue = {
      id: routeRuntime?.currentRoute?.id,
      path: routeRuntime?.currentPath,
      pattern: routeRuntime?.currentRoute?.path,
      params: routeRuntime?.params,
      query: routeRuntime?.query,
    };
    const resolved = getNestedValue(routeValue, refPath.slice(6));
    return applyTransform(
      resolved,
      (ref as FromRef).transform,
      (ref as FromRef).transformArg,
    );
  }

  if (isRef && refPath.startsWith("overlay.")) {
    const overlayValue = {
      id: overlayRuntime?.id,
      kind: overlayRuntime?.kind,
      payload: overlayRuntime?.payload,
      result: overlayRuntime?.result,
    };
    const resolved = getNestedValue(overlayValue, refPath.slice(8));
    return applyTransform(
      resolved,
      (ref as FromRef).transform,
      (ref as FromRef).transformArg,
    );
  }

  const { registry, cleanPath } = resolveSubscriptionTarget(
    refPath,
    pageRegistry,
    appRegistry,
  );

  const dotIndex = cleanPath.indexOf(".");
  const componentId =
    dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);
  const subPath = dotIndex === -1 ? "" : cleanPath.slice(dotIndex + 1);
  const sourceAtom = isRef ? registry?.get(componentId) : undefined;

  const value = useAtomValue(sourceAtom ?? UNDEFINED_ATOM, {
    store: registry?.store,
  });

  if (!isRef) {
    return ref;
  }

  const resolved = subPath ? getNestedValue(value, subPath) : value;
  return applyTransform(
    resolved,
    (ref as FromRef).transform,
    (ref as FromRef).transformArg,
  );
}

/**
 * Resolves an array of values that may contain `FromRef`s. Stable across
 * renders regardless of array length — use this when the number of items
 * is dynamic (e.g., a list of nav items, params object) and a per-item
 * `useSubscribe` would violate the rules of hooks.
 *
 * Internally uses a single subscription to the page registry store and
 * re-evaluates when any subscribed atom changes.
 */
export function useResolveFromMany(values: readonly unknown[]): unknown[] {
  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const overlayRuntime = useOverlayBindingContext();
  const routeRuntime = useRouteBindingContext();

  // Track all subscribed atoms across all values. Subscribing through
  // useSyncExternalStore once means we get re-renders for any change to
  // any tracked atom without violating rules of hooks.
  const subscribe = useCallback(
    (notify: () => void) => {
      const unsubs: Array<() => void> = [];
      const seen = new Set<unknown>();
      for (const value of values) {
        if (!isFromRef(value)) continue;
        const refPath = value.from;
        if (
          refPath.startsWith("params.") ||
          refPath.startsWith("route.") ||
          refPath.startsWith("overlay.")
        ) {
          continue;
        }
        const { registry, cleanPath } = resolveSubscriptionTarget(
          refPath,
          pageRegistry,
          appRegistry,
        );
        const dot = cleanPath.indexOf(".");
        const componentId = dot === -1 ? cleanPath : cleanPath.slice(0, dot);
        const sourceAtom = registry?.get(componentId);
        if (!sourceAtom || !registry || seen.has(sourceAtom)) continue;
        seen.add(sourceAtom);
        unsubs.push(registry.store.sub(sourceAtom, notify));
      }
      return () => {
        for (const u of unsubs) u();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageRegistry, appRegistry, values],
  );

  const getSnapshot = useCallback((): unknown[] => {
    return values.map((value) => {
      if (!isFromRef(value)) return value;
      const refPath = value.from;

      if (refPath.startsWith("params.")) {
        const resolved = getNestedValue(routeRuntime?.params, refPath.slice(7));
        return applyTransform(resolved, value.transform, value.transformArg);
      }
      if (refPath.startsWith("route.")) {
        const routeValue = {
          id: routeRuntime?.currentRoute?.id,
          path: routeRuntime?.currentPath,
          pattern: routeRuntime?.currentRoute?.path,
          params: routeRuntime?.params,
          query: routeRuntime?.query,
        };
        const resolved = getNestedValue(routeValue, refPath.slice(6));
        return applyTransform(resolved, value.transform, value.transformArg);
      }
      if (refPath.startsWith("overlay.")) {
        const overlayValue = {
          id: overlayRuntime?.id,
          kind: overlayRuntime?.kind,
          payload: overlayRuntime?.payload,
          result: overlayRuntime?.result,
        };
        const resolved = getNestedValue(overlayValue, refPath.slice(8));
        return applyTransform(resolved, value.transform, value.transformArg);
      }

      const { registry, cleanPath } = resolveSubscriptionTarget(
        refPath,
        pageRegistry,
        appRegistry,
      );
      const dot = cleanPath.indexOf(".");
      const componentId = dot === -1 ? cleanPath : cleanPath.slice(0, dot);
      const subPath = dot === -1 ? "" : cleanPath.slice(dot + 1);
      const sourceAtom = registry?.get(componentId);
      if (!sourceAtom || !registry) return undefined;
      const atomValue = registry.store.get(sourceAtom);
      const resolved = subPath ? getNestedValue(atomValue, subPath) : atomValue;
      return applyTransform(resolved, value.transform, value.transformArg);
    });
  }, [values, pageRegistry, appRegistry, overlayRuntime, routeRuntime]);

  // Cache snapshot to maintain referential stability across renders when
  // values haven't changed (useSyncExternalStore requires this).
  const lastSnapshotRef = useRef<unknown[] | null>(null);
  const stableSnapshot = useCallback(() => {
    const next = getSnapshot();
    const last = lastSnapshotRef.current;
    if (
      last &&
      last.length === next.length &&
      last.every((v, i) => Object.is(v, next[i]))
    ) {
      return last;
    }
    lastSnapshotRef.current = next;
    return next;
  }, [getSnapshot]);

  return useSyncExternalStore(subscribe, stableSnapshot, stableSnapshot);
}

/**
 * Resolves all `FromRef` values in a config object at once.
 */
export function useResolveFrom<T extends Record<string, unknown>>(
  config: T,
): ResolvedConfig<T> {
  const appContext = {};
  const authContext = {};
  const overlayRuntime = useOverlayBindingContext();
  const routeRuntime = useRouteBindingContext();
  const refs = extractFromRefs(config);
  const resolved = new Map<string, unknown>();
  const expressionRefs = new Map<string, string[]>();
  const expressionValues = new Map<string, string>();

  const collectExpressions = (value: unknown, path = ""): void => {
    if (isExprRef(value)) {
      expressionRefs.set(path, extractExpressionRefs(value.expr));
      expressionValues.set(path, value.expr);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        collectExpressions(item, path ? `${path}.${index}` : String(index));
      });
      return;
    }

    if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(
        value as Record<string, unknown>,
      )) {
        collectExpressions(nested, path ? `${path}.${key}` : key);
      }
    }
  };

  collectExpressions(config);

  for (const [path, fromRef] of refs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolved.set(path, useSubscribe(fromRef));
  }

  const expressionRefValues = new Map<string, unknown>();
  for (const [path, refsForPath] of expressionRefs) {
    for (const ref of refsForPath) {
      if (
        ref.startsWith("auth.") ||
        ref.startsWith("app.") ||
        ref.startsWith("route.") ||
        ref.startsWith("params.") ||
        ref.startsWith("overlay.")
      ) {
        continue;
      }

      // eslint-disable-next-line react-hooks/rules-of-hooks
      expressionRefValues.set(`${path}:${ref}`, useSubscribe({ from: ref }));
    }
  }

  const baseResolved = applyResolved(config, resolved);

  const applyExpressions = (value: unknown, path = ""): unknown => {
    if (isExprRef(value)) {
      const expression = expressionValues.get(path);
      if (!expression) {
        return value;
      }

      const context = expressionRefs
        .get(path)
        ?.reduce<Record<string, unknown>>((acc, ref) => {
          if (
            ref.startsWith("auth.") ||
            ref.startsWith("app.") ||
            ref.startsWith("route.") ||
            ref.startsWith("params.") ||
            ref.startsWith("overlay.")
          ) {
            return acc;
          }

          const segments = ref.split(".");
          let cursor = acc;
          for (let index = 0; index < segments.length - 1; index += 1) {
            const segment = segments[index]!;
            if (
              !cursor[segment] ||
              typeof cursor[segment] !== "object" ||
              Array.isArray(cursor[segment])
            ) {
              cursor[segment] = {};
            }
            cursor = cursor[segment] as Record<string, unknown>;
          }
          cursor[segments[segments.length - 1]!] = expressionRefValues.get(
            `${path}:${ref}`,
          );
          return acc;
        }, {});

      return evaluateExpression(expression, {
        ...(context ?? {}),
        app: appContext,
        auth: authContext,
        route: {
          id: routeRuntime?.currentRoute?.id,
          path: routeRuntime?.currentPath,
          pattern: routeRuntime?.currentRoute?.path,
          params: routeRuntime?.params,
          query: routeRuntime?.query,
        },
        overlay: {
          id: overlayRuntime?.id,
          kind: overlayRuntime?.kind,
          payload: overlayRuntime?.payload,
          result: overlayRuntime?.result,
        },
      });
    }

    if (Array.isArray(value)) {
      return value.map((item, index) =>
        applyExpressions(item, path ? `${path}.${index}` : String(index)),
      );
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
          key,
          applyExpressions(nested, path ? `${path}.${key}` : key),
        ]),
      );
    }

    return value;
  };

  return applyExpressions(baseResolved) as ResolvedConfig<T>;
}
