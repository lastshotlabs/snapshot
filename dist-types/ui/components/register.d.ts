/**
 * Register all built-in config-driven components with the manifest system.
 *
 * The function is idempotent so boot code can call it safely without worrying
 * about duplicate registrations.
 */
export declare function registerBuiltInComponents(force?: boolean): void;
/** Reset the built-in component registration guard so tests can rebuild the registry. */
export declare function resetBuiltInComponentRegistration(): void;
