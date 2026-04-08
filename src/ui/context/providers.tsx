import {
  AppStateProvider,
  AppStateRegistryContext,
  RouteStateProvider,
  RouteStateRegistryContext,
} from "../state/index";
import type { AppContextProviderProps, PageContextProviderProps } from "./types";

/**
 * React context for the page-level atom registry.
 * Created fresh on each route/page mount. Destroyed on unmount.
 * @internal
 */
export const PageRegistryContext = RouteStateRegistryContext;

/**
 * React context for the app-level atom registry.
 * Persists across route changes for the lifetime of the app.
 * @internal
 */
export const AppRegistryContext = AppStateRegistryContext;

/**
 * Provides persistent global state that survives route changes.
 * Initializes globals from the manifest config.
 */
export function AppContextProvider({
  globals,
  resources,
  api,
  children,
}: AppContextProviderProps) {
  return (
    <AppStateProvider state={globals} resources={resources} api={api}>
      {children}
    </AppStateProvider>
  );
}

/**
 * Provides per-page state that is destroyed on route change.
 */
export function PageContextProvider({
  state,
  resources,
  api,
  children,
}: PageContextProviderProps) {
  return (
    <RouteStateProvider state={state} resources={resources} api={api}>
      {children}
    </RouteStateProvider>
  );
}
