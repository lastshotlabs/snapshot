import { useCallback, useContext } from "react";
import { atom } from "jotai";
import { useAtomValue } from "jotai/react";
import {
  AppStateDefinitionsContext,
  AppStateRegistryContext,
  RouteStateDefinitionsContext,
  RouteStateRegistryContext,
} from "./providers";
import type { AtomRegistry, StateConfigMap, StateScope } from "./types";

const UNDEFINED_ATOM = atom<unknown>(undefined);

export type StateHookScope = StateScope | "auto";

function resolveStateRegistry(
  id: string,
  scope: StateHookScope,
  routeRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
  routeState: StateConfigMap,
  appState: StateConfigMap,
): AtomRegistry | null {
  if (scope === "route") {
    return routeRegistry;
  }

  if (scope === "app") {
    return appRegistry;
  }

  if (id in routeState) {
    return routeRegistry;
  }

  if (id in appState) {
    return appRegistry;
  }

  if (routeRegistry?.get(id)) {
    return routeRegistry;
  }

  if (appRegistry?.get(id)) {
    return appRegistry;
  }

  return routeRegistry ?? appRegistry;
}

function resolveStateDefinition(
  id: string,
  scope: StateHookScope,
  routeState: StateConfigMap,
  appState: StateConfigMap,
) {
  if (scope === "route") {
    return routeState[id];
  }

  if (scope === "app") {
    return appState[id];
  }

  return routeState[id] ?? appState[id];
}

export function useStateValue(
  id: string,
  options?: { scope?: StateHookScope },
): unknown {
  const routeRegistry = useContext(RouteStateRegistryContext);
  const appRegistry = useContext(AppStateRegistryContext);
  const routeState = useContext(RouteStateDefinitionsContext);
  const appState = useContext(AppStateDefinitionsContext);
  const scope = options?.scope ?? "auto";
  const registry = resolveStateRegistry(
    id,
    scope,
    routeRegistry,
    appRegistry,
    routeState,
    appState,
  );
  const stateAtom = registry?.get(id);

  return useAtomValue(stateAtom ?? UNDEFINED_ATOM, {
    store: registry?.store,
  });
}

export function useSetStateValue(
  id: string,
  options?: { scope?: StateHookScope },
): (value: unknown) => void {
  const routeRegistry = useContext(RouteStateRegistryContext);
  const appRegistry = useContext(AppStateRegistryContext);
  const routeState = useContext(RouteStateDefinitionsContext);
  const appState = useContext(AppStateDefinitionsContext);
  const scope = options?.scope ?? "auto";

  return useCallback(
    (value: unknown) => {
      const registry = resolveStateRegistry(
        id,
        scope,
        routeRegistry,
        appRegistry,
        routeState,
        appState,
      );
      if (!registry) {
        return;
      }

      const stateAtom = registry.register(id);
      registry.store.set(stateAtom, value);
    },
    [appRegistry, appState, id, routeRegistry, routeState, scope],
  );
}

export function useResetStateValue(
  id: string,
  options?: { scope?: StateHookScope },
): () => void {
  const routeRegistry = useContext(RouteStateRegistryContext);
  const appRegistry = useContext(AppStateRegistryContext);
  const routeState = useContext(RouteStateDefinitionsContext);
  const appState = useContext(AppStateDefinitionsContext);
  const scope = options?.scope ?? "auto";

  return useCallback(() => {
    const registry = resolveStateRegistry(
      id,
      scope,
      routeRegistry,
      appRegistry,
      routeState,
      appState,
    );
    if (!registry) {
      return;
    }

    const definition = resolveStateDefinition(id, scope, routeState, appState);
    const stateAtom = registry.register(id);
    registry.store.set(stateAtom, definition?.default);
  }, [appRegistry, appState, id, routeRegistry, routeState, scope]);
}
