import type { ComponentType } from "react";

/**
 * A config-driven component receives a single `config` prop.
 * The config shape is defined by the component's Zod schema.
 */
export type ConfigDrivenComponent = ComponentType<{
  config: Record<string, unknown>;
}>;

const runtimeComponentRegistry = new Map<string, ConfigDrivenComponent>();

/**
 * Register a component for manifest rendering.
 * Used by the framework for built-in components and by consumers for custom components.
 *
 * @param type - The component type string used in manifest configs (e.g. 'modal', 'tabs')
 * @param component - The React component to render for this type
 */
export function registerComponent(
  type: string,
  component: ConfigDrivenComponent,
): void {
  if (
    runtimeComponentRegistry.has(type) &&
    process.env.NODE_ENV === "development"
  ) {
    console.warn(`[snapshot] Overriding component "${type}"`);
  }
  runtimeComponentRegistry.set(type, component);
}

/**
 * Get a registered component by type string.
 *
 * @param type - The component type to look up
 * @returns The registered component, or undefined if not found
 */
export function getRegisteredComponent(
  type: string,
): ConfigDrivenComponent | undefined {
  return runtimeComponentRegistry.get(type);
}

/**
 * Get all registered component type names.
 * Useful for validation error messages.
 *
 * @returns Array of registered type strings
 */
export function getRegisteredTypes(): string[] {
  return [...runtimeComponentRegistry.keys()];
}
