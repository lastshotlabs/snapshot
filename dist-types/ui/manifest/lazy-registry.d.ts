/**
 * Collect manifest component types from any nested config object.
 */
export declare function collectComponentTypes(value: unknown, types?: Set<string>): Set<string>;
/**
 * Ensure the requested component types are registered in the runtime registry.
 */
export declare function ensureComponentsLoaded(types: string[]): Promise<void>;
export declare function resetLazyRegistry(): void;
