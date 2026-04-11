/**
 * A manifest reference to a per-environment value.
 */
export type EnvRef = {
    env: string;
    default?: string;
};
/**
 * Zod schema for a manifest environment reference.
 */
export declare const envRefSchema: any;
/**
 * Check whether a value is an environment reference.
 *
 * @param value - Unknown input
 * @returns True when the value matches the EnvRef shape
 */
export declare function isEnvRef(value: unknown): value is EnvRef;
/**
 * Resolve an EnvRef using the configured env source.
 *
 * @param ref - Environment reference to resolve
 * @param env - Key/value env source
 * @returns The resolved value, or the declared default when missing
 */
export declare function resolveEnvRef(ref: EnvRef, env: Record<string, string | undefined>): string | undefined;
/**
 * Build the default env source from the current process environment.
 *
 * This stays CJS-safe so the shared manifest code can build into both ESM and
 * CJS bundles without import.meta warnings.
 *
 * @returns A merged env record with string values
 */
export declare function getDefaultEnvSource(): Record<string, string | undefined>;
