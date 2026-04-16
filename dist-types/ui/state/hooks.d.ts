import type { StateScope } from "./types";
/** Hook-level scope override that can force app, route, or auto-discovered state resolution. */
export type StateHookScope = StateScope | "auto";
/** Read the current value for a named manifest state entry. */
export declare function useStateValue(id: string, options?: {
    scope?: StateHookScope;
}): unknown;
/** Return a setter that writes to a named manifest state entry in the resolved scope. */
export declare function useSetStateValue(id: string, options?: {
    scope?: StateHookScope;
}): (value: unknown) => void;
/** Return a callback that resets a named manifest state entry to its configured default. */
export declare function useResetStateValue(id: string, options?: {
    scope?: StateHookScope;
}): () => void;
