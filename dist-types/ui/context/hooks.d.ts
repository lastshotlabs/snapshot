import type { FromRef, ResolvedConfig } from "./types";
/**
 * Registers a component in the page context and returns a setter function
 * to publish values that other components can subscribe to via `{ from: "id" }`.
 */
export declare function usePublish(id: string | undefined): (value: unknown) => void;
/**
 * Subscribes to a value from the shared binding/state registry system.
 */
export declare function useSubscribe(ref: FromRef | unknown): unknown;
/**
 * Resolves all `FromRef` values in a config object at once.
 */
export declare function useResolveFrom<T extends Record<string, unknown>>(config: T): ResolvedConfig<T>;
