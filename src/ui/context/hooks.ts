import { useCallback, useContext, useEffect, useRef } from "react";
import { atom } from "jotai";
import { useAtomValue } from "jotai/react";
import type { PrimitiveAtom } from "jotai";
import { PageRegistryContext, AppRegistryContext } from "./providers";
import { useOverlayRuntime } from "../manifest/runtime";
import {
  getNestedValue,
  isFromRef,
  extractFromRefs,
  applyResolved,
  applyTransform,
} from "./utils";
import type { FromRef, ResolvedConfig } from "./types";
import type { AtomRegistry } from "../state/types";

/** Fallback atom used when the source atom doesn't exist yet. */
const UNDEFINED_ATOM = atom<unknown>(undefined);

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
            : pageRegistry ?? appRegistry,
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
  const overlayRuntime = useOverlayRuntime();
  const refPath = isRef ? ref.from : "";

  if (isRef && refPath.startsWith("overlay.")) {
    const overlayValue = {
      id: overlayRuntime?.id,
      kind: overlayRuntime?.kind,
      payload: overlayRuntime?.payload,
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
 * Resolves all `FromRef` values in a config object at once.
 */
export function useResolveFrom<T extends Record<string, unknown>>(
  config: T,
): ResolvedConfig<T> {
  const refs = extractFromRefs(config);
  const resolved = new Map<string, unknown>();

  for (const [path, fromRef] of refs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolved.set(path, useSubscribe(fromRef));
  }

  return applyResolved(config, resolved) as ResolvedConfig<T>;
}
