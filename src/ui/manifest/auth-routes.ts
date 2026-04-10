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
export type AuthScreen =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "mfa";

/**
 * Minimal manifest shape needed to validate auth screen ids.
 */
export type AuthRouteManifest = {
  auth?: {
    screens: AuthScreen[];
  };
  routes: {
    id: string;
    path: string;
  }[];
};

/**
 * Resolve the path for an auth screen by matching the route id.
 *
 * @param manifest - Manifest routes to inspect
 * @param screen - Auth screen name
 * @returns The matching route path, or undefined when the route id is absent
 */
export function getAuthScreenPath(
  manifest: CompiledManifest,
  screen: AuthScreen,
): string | undefined {
  return manifest.routes.find((route) => route.id === screen)?.path;
}

/**
 * Collect auth screens that are enabled without a matching route id.
 *
 * @param manifest - Manifest data with auth and route declarations
 * @returns Enabled auth screens that do not have a matching route id
 */
export function getMissingAuthScreenIds(
  manifest: AuthRouteManifest,
): AuthScreen[] {
  if (!manifest.auth) {
    return [];
  }

  const routeIds = new Set(manifest.routes.map((route) => route.id));
  return manifest.auth.screens.filter((screen) => !routeIds.has(screen));
}
