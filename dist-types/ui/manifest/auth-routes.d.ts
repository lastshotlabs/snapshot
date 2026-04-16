/**
 * Shared auth route helpers.
 *
 * Auth screens are resolved by route id only. The manifest must declare a route
 * whose `id` matches the enabled auth screen name.
 */
import type { CompiledManifest } from "./types";
/**
 * Canonical auth screen names supported by the manifest auth runtime.
 */
export type AuthScreen = "login" | "register" | "forgot-password" | "reset-password" | "verify-email" | "mfa" | "sso-callback";
/**
 * Resolve the path for an auth screen by matching the route id.
 *
 * @param manifest - Manifest routes to inspect
 * @param screen - Auth screen name
 * @returns The matching route path, or undefined when the route id is absent
 */
export declare function getAuthScreenPath(manifest: CompiledManifest, screen: AuthScreen): string | undefined;
