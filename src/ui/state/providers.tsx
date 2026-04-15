import { createContext, useEffect, useMemo, useRef } from "react";
import { Provider as JotaiProvider } from "jotai/react";
import { buildRequestUrl, resolveEndpointTarget } from "../manifest/resources";
import {
  AtomRegistryImpl,
  createComputedAtom,
  extractStateDependencies,
} from "./registry";
import { apiClientAtom } from "./api";
import { readPersistedState, writePersistedState } from "./persist";
import type {
  AtomRegistry,
  StateConfigMap,
  StateProviderProps,
  StateScope,
} from "./types";

export const RouteStateRegistryContext = createContext<AtomRegistry | null>(
  null,
);
export const AppStateRegistryContext = createContext<AtomRegistry | null>(null);
export const RouteStateDefinitionsContext = createContext<StateConfigMap>({});
export const AppStateDefinitionsContext = createContext<StateConfigMap>({});

function filterStateByScope(
  state: StateConfigMap | undefined,
  scope: StateScope,
): StateConfigMap {
  if (!state) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(state).filter(([, config]) => {
      const resolvedScope = config.scope ?? "app";
      return resolvedScope === scope;
    }),
  );
}

function initializeRegistryState(
  registry: AtomRegistry,
  state: StateConfigMap,
  resources: StateProviderProps["resources"],
  api: StateProviderProps["api"],
): void {
  for (const [id, config] of Object.entries(state)) {
    if (config.compute) {
      registry.register(id, createComputedAtom(config.compute, registry));
      continue;
    }

    const atom = registry.register(id);
    const persistConfig =
      config.persist === "localStorage" || config.persist === "sessionStorage"
        ? { storage: config.persist, key: id }
        : typeof config.persist === "object"
          ? { storage: config.persist.storage, key: config.persist.key ?? id }
          : null;
    const persistedValue =
      persistConfig?.storage
        ? readPersistedState(persistConfig.key, persistConfig.storage)
        : undefined;

    if (persistedValue !== undefined) {
      registry.store.set(atom, persistedValue);
    } else if (config.default !== undefined) {
      registry.store.set(atom, config.default);
    }

    if (persistConfig?.storage) {
      registry.store.sub(atom, () => {
        writePersistedState(
          persistConfig.key,
          registry.store.get(atom),
          persistConfig.storage,
        );
      });
    }

    if (config.data && api) {
      const loadData = async () => {
        try {
          const request = resolveEndpointTarget(config.data!, resources);
          const url = buildRequestUrl(request.endpoint, request.params);
          let data: unknown;

          switch (request.method) {
            case "POST":
              data = await api.post(url, undefined);
              break;
            case "PUT":
              data = await api.put(url, undefined);
              break;
            case "PATCH":
              data = await api.patch(url, undefined);
              break;
            case "DELETE":
              data = await api.delete(url);
              break;
            default:
              data = await api.get(url);
          }

          registry.store.set(atom, data);
        } catch {
          // Keep current/default value on initialization failure.
        }
      };

      void loadData();
    }
  }
}

function primeRegistryState(
  registry: AtomRegistry,
  state: StateConfigMap,
): void {
  for (const [id, config] of Object.entries(state)) {
    if (registry.get(id)) {
      continue;
    }

    const atom = config.compute
      ? registry.register(id, createComputedAtom(config.compute, registry))
      : registry.register(id);
    if (config.default !== undefined) {
      registry.store.set(atom, config.default);
    }
  }
}

function assertNoComputedCycles(state: StateConfigMap): void {
  const dependencyMap = Object.fromEntries(
    Object.entries(state).map(([id, config]) => [
      id,
      config.compute ? extractStateDependencies(config.compute) : [],
    ]),
  ) as Record<string, string[]>;

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string) => {
    if (visited.has(id)) {
      return;
    }
    if (visiting.has(id)) {
      throw new Error(`Circular computed state dependency detected at "${id}"`);
    }

    visiting.add(id);
    for (const dependency of dependencyMap[id] ?? []) {
      if (dependency in dependencyMap) {
        visit(dependency);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };

  Object.keys(dependencyMap).forEach(visit);
}

export function AppStateProvider({
  state,
  resources,
  api,
  children,
}: StateProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
    registryRef.current.store.set(apiClientAtom, api ?? null);
  }

  const scopedState = useMemo(() => filterStateByScope(state, "app"), [state]);
  assertNoComputedCycles(scopedState);
  primeRegistryState(registryRef.current, scopedState);

  useEffect(() => {
    initializeRegistryState(registryRef.current!, scopedState, resources, api);
    // App-scope state is initialized once for the provider lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registryRef.current?.store.set(apiClientAtom, api ?? null);
  }, [api]);

  return (
    <AppStateDefinitionsContext.Provider value={scopedState}>
      <AppStateRegistryContext.Provider value={registryRef.current}>
        <JotaiProvider store={registryRef.current.store}>
          {children}
        </JotaiProvider>
      </AppStateRegistryContext.Provider>
    </AppStateDefinitionsContext.Provider>
  );
}

export function RouteStateProvider({
  state,
  resources,
  api,
  children,
}: StateProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
  }

  const scopedState = useMemo(
    () => filterStateByScope(state, "route"),
    [state],
  );
  assertNoComputedCycles(scopedState);
  primeRegistryState(registryRef.current, scopedState);

  useEffect(() => {
    initializeRegistryState(registryRef.current!, scopedState, resources, api);
    // Route-scope state is recreated by remounting this provider per route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RouteStateDefinitionsContext.Provider value={scopedState}>
      <RouteStateRegistryContext.Provider value={registryRef.current}>
        {children}
      </RouteStateRegistryContext.Provider>
    </RouteStateDefinitionsContext.Provider>
  );
}
