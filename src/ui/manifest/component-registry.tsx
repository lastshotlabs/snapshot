/**
 * Runtime component registry.
 *
 * Maps component type strings to React component implementations.
 * Used by ComponentRenderer to resolve config → component.
 * Framework registers built-in components; consumers register custom ones.
 */

import type { ConfigDrivenComponent, CustomComponentConfig } from "./types";

const runtimeComponentRegistry = new Map<string, ConfigDrivenComponent>();

/**
 * Register a React component for a manifest component type string.
 * Used by the framework for built-in components and by consumers for custom components.
 *
 * Emits a dev warning if overriding an existing registration.
 *
 * @param type - The component type string (e.g. "row", "heading", "stat-card")
 * @param component - The React component that renders this type
 */
export function registerComponent(
  type: string,
  component: ConfigDrivenComponent,
): void {
  if (
    runtimeComponentRegistry.has(type) &&
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] === "development"
  ) {
    console.warn(`[snapshot] Overriding component "${type}"`);
  }
  runtimeComponentRegistry.set(type, component);
}

/**
 * Retrieve the registered React component for a type string.
 * Returns the CustomComponentWrapper for `"custom"` type.
 * Returns undefined if no component is registered for the given type.
 *
 * @param type - The component type string
 * @returns The registered component, or undefined
 */
export function getRegisteredComponent(
  type: string,
): ConfigDrivenComponent | undefined {
  if (type === "custom") return CustomComponentWrapper;
  return runtimeComponentRegistry.get(type);
}

/**
 * Wrapper component for the `{ "type": "custom", "component": "Name" }` escape hatch.
 * Looks up the named component from the registry and renders it with the config's props.
 */
function CustomComponentWrapper({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const typedConfig = config as unknown as CustomComponentConfig;
  const Component = runtimeComponentRegistry.get(typedConfig.component);
  if (!Component) {
    if (
      typeof process !== "undefined" &&
      process.env?.["NODE_ENV"] === "development"
    ) {
      console.warn(
        `[snapshot] Custom component "${typedConfig.component}" not registered`,
      );
    }
    return null;
  }
  const props = typedConfig.props ?? {};
  return <Component config={{ ...config, ...props }} />;
}
