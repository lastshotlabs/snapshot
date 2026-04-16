/**
 * Boot-time built-in registration.
 *
 * This centralizes the built-in component and flavor registration so the
 * runtime can call it explicitly before any manifest-driven work begins.
 */
/**
 * Register all built-in manifest registries exactly once.
 *
 * @returns Nothing.
 */
export declare function bootBuiltins(): void;
/** Reset the boot flag so tests can re-run built-in registration deterministically. */
export declare function resetBootBuiltins(): void;
