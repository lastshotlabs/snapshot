/**
 * Generate a JSON Schema for snapshot manifests.
 *
 * The schema is intentionally conservative and focuses on the public top-level
 * manifest contract so editors can provide autocomplete and inline validation
 * without requiring Snapshot's full runtime schema registry at generation time.
 */
export declare function generateJsonSchema(): Record<string, unknown>;
