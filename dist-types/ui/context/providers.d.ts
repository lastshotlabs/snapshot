import type { AppContextProviderProps, PageContextProviderProps } from "./types";
/**
 * React context for the page-level atom registry.
 * Created fresh on each route/page mount. Destroyed on unmount.
 * @internal
 */
export declare const PageRegistryContext: import("react").Context<import("./types").AtomRegistry | null>;
/**
 * React context for the app-level atom registry.
 * Persists across route changes for the lifetime of the app.
 * @internal
 */
export declare const AppRegistryContext: import("react").Context<import("./types").AtomRegistry | null>;
/**
 * Provides persistent global state that survives route changes.
 * Initializes globals from the manifest config.
 */
export declare function AppContextProvider({ globals, resources, api, children, }: AppContextProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Provides per-page state that is destroyed on route change.
 */
export declare function PageContextProvider({ state, resources, api, children, }: PageContextProviderProps): import("react/jsx-runtime").JSX.Element;
