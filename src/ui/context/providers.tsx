import { createContext, useEffect, useRef } from "react";
import { Provider as JotaiProvider } from "jotai/react";
import { AtomRegistryImpl } from "./registry";
import { parseDataString } from "./utils";
import type {
  AtomRegistry,
  AppContextProviderProps,
  PageContextProviderProps,
} from "./types";

/**
 * React context for the page-level atom registry.
 * Created fresh on each route/page mount. Destroyed on unmount.
 * @internal
 */
export const PageRegistryContext = createContext<AtomRegistry | null>(null);

/**
 * React context for the app-level atom registry.
 * Persists across route changes for the lifetime of the app.
 * @internal
 */
export const AppRegistryContext = createContext<AtomRegistry | null>(null);

/**
 * Provides persistent global state that survives route changes.
 * Initializes globals from the manifest config — sets defaults immediately,
 * fetches from endpoints when specified.
 *
 * @param props - Global state definitions, API client, and children
 *
 * @example
 * ```tsx
 * <AppContextProvider
 *   globals={{ user: {}, cart: { data: "GET /api/cart", default: { items: [] } } }}
 *   api={apiClient}
 * >
 *   <App />
 * </AppContextProvider>
 * ```
 */
export function AppContextProvider({
  globals,
  api,
  children,
}: AppContextProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
  }
  const registry = registryRef.current;

  // Initialize globals on mount
  useEffect(() => {
    if (!globals) return;
    for (const [id, config] of Object.entries(globals)) {
      const a = registry.register(id);

      // Set default value immediately
      if (config.default !== undefined) {
        registry.store.set(a, config.default);
      }

      // Fetch from endpoint if specified
      if (config.data && api) {
        const [method, endpoint] = parseDataString(config.data);
        const fetchData = async () => {
          try {
            let data: unknown;
            switch (method.toUpperCase()) {
              case "POST":
                data = await api.post(endpoint, undefined);
                break;
              case "PUT":
                data = await api.put(endpoint, undefined);
                break;
              case "PATCH":
                data = await api.patch(endpoint, undefined);
                break;
              case "DELETE":
                data = await api.delete(endpoint);
                break;
              default:
                data = await api.get(endpoint);
            }
            registry.store.set(a, data);
          } catch {
            // Fetch failed — keep default value if set
          }
        };
        void fetchData();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppRegistryContext.Provider value={registry}>
      <JotaiProvider store={registry.store}>{children}</JotaiProvider>
    </AppRegistryContext.Provider>
  );
}

/**
 * Provides per-page component state that is destroyed on route change.
 * Each mount creates a fresh atom registry, so page-level components
 * start with a clean slate.
 *
 * @param props - Children to render within the page context
 *
 * @example
 * ```tsx
 * // In a route component
 * <PageContextProvider>
 *   <UsersTable />
 *   <UserDetail />
 * </PageContextProvider>
 * ```
 */
export function PageContextProvider({ children }: PageContextProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
  }

  return (
    <PageRegistryContext.Provider value={registryRef.current}>
      {children}
    </PageRegistryContext.Provider>
  );
}
