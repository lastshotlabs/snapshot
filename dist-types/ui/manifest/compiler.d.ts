import { ZodError, type SafeParseReturnType } from "zod";
import type { CompiledManifest, ManifestConfig, ParsedManifestConfig } from "./types";
/**
 * Define a manifest without compiling it.
 *
 * @param manifest - Manifest object to return unchanged
 * @returns The same manifest object, typed as `ManifestConfig`
 */
export declare function defineManifest<TManifest extends ManifestConfig>(manifest: TManifest): TManifest;
/**
 * Parse an unknown value into a validated manifest.
 *
 * @param manifest - Unknown input value
 * @returns The parsed manifest
 */
export declare function parseManifest(manifest: unknown): ParsedManifestConfig;
/**
 * Parse an unknown value into a validated manifest without throwing.
 *
 * @param manifest - Unknown input value
 * @returns A Zod safe-parse result for the manifest
 */
export declare function safeParseManifest(manifest: unknown): SafeParseReturnType<unknown, ParsedManifestConfig>;
/**
 * Parse and compile a manifest into the runtime shape.
 *
 * @param manifest - Manifest JSON or object
 * @param options - Compile options
 * @returns The compiled manifest runtime model
 */
export declare function compileManifest(manifest: unknown): CompiledManifest;
/**
 * Parse and compile a manifest into the runtime shape using a custom env source.
 *
 * @param manifest - Manifest JSON or object
 * @param env - Environment source used to resolve `{ env: "..." }` values
 * @returns The compiled manifest runtime model
 */
export declare function compileManifestWithEnv(manifest: unknown, env: Record<string, string | undefined>): CompiledManifest;
/**
 * Parse and compile a manifest without throwing.
 *
 * @param manifest - Manifest JSON or object
 * @param options - Compile options
 * @returns The parsed manifest and compiled runtime model, or validation errors
 */
export declare function safeCompileManifest(manifest: unknown): {
    success: true;
    manifest: ParsedManifestConfig;
    compiled: CompiledManifest;
} | {
    success: false;
    error: ZodError<unknown>;
};
