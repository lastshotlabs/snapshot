/**
 * Boot-time built-in registration.
 *
 * This centralizes the built-in component and flavor registration so the
 * runtime can call it explicitly before any manifest-driven work begins.
 */

import { STRUCTURAL_COMPONENTS } from "./structural";
import { registerBuiltInComponents } from "../components/register";
import { registerBuiltInFlavors } from "../tokens/flavors";
import { registerBuiltInLayouts } from "../layouts/register";
import { registerComponent } from "./component-registry";
import { registerBuiltInGuards } from "./guard-registry";

let booted = false;

/**
 * Register all built-in manifest registries exactly once.
 *
 * @returns Nothing.
 */
export function bootBuiltins(): void {
  if (booted) {
    return;
  }

  booted = true;
  registerBuiltInComponents();
  for (const [type, component] of Object.entries(STRUCTURAL_COMPONENTS)) {
    registerComponent(type, component);
  }
  registerBuiltInFlavors();
  registerBuiltInLayouts();
  registerBuiltInGuards();
}

export function resetBootBuiltins(): void {
  booted = false;
}
