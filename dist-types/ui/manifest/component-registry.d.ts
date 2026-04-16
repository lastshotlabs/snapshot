/**
 * Runtime component registry.
 *
 * Maps component type strings to React component implementations.
 * Used by ComponentRenderer to resolve config → component.
 * Framework registers built-in components; consumers register custom ones.
 */
import type { ConfigDrivenComponent } from "./types";
/**
 * Register a React component for a manifest component type string.
 * Used by the framework for built-in components and by consumers for custom components.
 *
 * Emits a dev warning if overriding an existing registration.
 *
 * @param type - The component type string (e.g. "row", "heading", "stat-card")
 * @param component - The React component that renders this type
 */
export declare function registerComponent(type: string, component: ConfigDrivenComponent): void;
/**
 * Retrieve the registered React component for a type string.
 * Returns undefined if no component is registered for the given type.
 *
 * @param type - The component type string
 * @returns The registered component, or undefined
 */
export declare function getRegisteredComponent(type: string): ConfigDrivenComponent | undefined;
export declare function resetRegisteredComponents(): void;
