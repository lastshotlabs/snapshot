import type { ComponentType } from "react";
import type { z } from "zod";

/**
 * Internal registry mapping component type strings to their React implementations.
 * Populated by `registerComponent()` calls at module load time.
 */
const componentRegistry = new Map<string, ComponentType<{ config: unknown }>>();

/**
 * Internal registry mapping component type strings to their Zod config schemas.
 * Populated by `registerComponentSchema()` calls at module load time.
 */
const schemaRegistry = new Map<string, z.ZodType<unknown>>();

/**
 * Register a config-driven component implementation.
 * Called at module load time to make a component available to the manifest renderer.
 *
 * @param type - The component type string (e.g. 'detail-card', 'data-table')
 * @param component - The React component that renders the config
 */
export function registerComponent(
  type: string,
  component: ComponentType<{ config: unknown }>,
): void {
  componentRegistry.set(type, component);
}

/**
 * Register a Zod schema for a config-driven component type.
 * Used for manifest validation.
 *
 * @param type - The component type string
 * @param schema - The Zod schema that validates the component's config
 */
export function registerComponentSchema(
  type: string,
  schema: z.ZodType<unknown>,
): void {
  schemaRegistry.set(type, schema);
}

/**
 * Look up a registered component by type string.
 *
 * @param type - The component type string
 * @returns The React component, or undefined if not registered
 */
export function getComponent(
  type: string,
): ComponentType<{ config: unknown }> | undefined {
  return componentRegistry.get(type);
}

/**
 * Look up a registered schema by type string.
 *
 * @param type - The component type string
 * @returns The Zod schema, or undefined if not registered
 */
export function getComponentSchema(
  type: string,
): z.ZodType<unknown> | undefined {
  return schemaRegistry.get(type);
}

/**
 * Get all registered component type strings.
 *
 * @returns Array of registered type strings
 */
export function getRegisteredTypes(): string[] {
  return Array.from(componentRegistry.keys());
}
