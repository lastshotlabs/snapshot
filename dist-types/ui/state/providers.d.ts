import type { AtomRegistry, StateProviderProps } from "./types";
export declare const RouteStateRegistryContext: import("react").Context<AtomRegistry | null>;
export declare const AppStateRegistryContext: import("react").Context<AtomRegistry | null>;
export declare const RouteStateDefinitionsContext: import("react").Context<import("@lastshotlabs/frontend-contract/state").StateConfigMap>;
export declare const AppStateDefinitionsContext: import("react").Context<import("@lastshotlabs/frontend-contract/state").StateConfigMap>;
export declare function AppStateProvider({ state, resources, api, children, }: StateProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function RouteStateProvider({ state, resources, api, children, }: StateProviderProps): import("react/jsx-runtime").JSX.Element;
