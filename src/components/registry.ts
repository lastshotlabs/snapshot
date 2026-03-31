import type { z } from "zod";
import type { ComponentEntry } from "./types";

/**
 * Component registry — maps component type names to their React implementations
 * and config schemas.
 *
 * Supports hierarchical composition via `extend()`. A child registry inherits
 * all parent registrations and can override or add its own. This mirrors
 * bunshot's HandlerRegistry pattern.
 *
 * @example
 * ```ts
 * const base = createComponentRegistry()
 * base.register('table', TableComponent, tableConfigSchema)
 *
 * // Child inherits 'table', can override or add
 * const custom = base.extend()
 * custom.register('table', CustomTableComponent, customTableConfigSchema)
 * custom.register('kanban', KanbanComponent, kanbanConfigSchema)
 * ```
 */
export interface ComponentRegistry {
  /**
   * Register a component by type name.
   * Overwrites any existing registration with the same name.
   */
  register(
    name: string,
    component: React.ComponentType<{
      config: Record<string, unknown>;
      id?: string;
    }>,
    schema: z.ZodType,
  ): void;

  /**
   * Resolve a component by type name.
   * Searches this registry first, then walks up the parent chain.
   * Returns null if not found.
   */
  resolve(name: string): ComponentEntry | null;

  /**
   * Get the config schema for a component type.
   * Returns null if the component is not registered.
   */
  getSchema(name: string): z.ZodType | null;

  /**
   * List all registered component type names (including inherited from parents).
   */
  list(): string[];

  /**
   * Check if a component type is registered (including in parents).
   */
  has(name: string): boolean;

  /**
   * Create a child registry that inherits all registrations from this one.
   * The child can override parent registrations or add new ones.
   */
  extend(): ComponentRegistry;
}

/**
 * Creates a new component registry. Optionally backed by a parent for
 * hierarchical composition.
 */
export function createComponentRegistry(parent?: ComponentRegistry): ComponentRegistry {
  const entries = new Map<string, ComponentEntry>();

  const registry: ComponentRegistry = {
    register(name, component, schema) {
      entries.set(name, { component, schema });
    },

    resolve(name) {
      const local = entries.get(name);
      if (local) return local;
      return parent?.resolve(name) ?? null;
    },

    getSchema(name) {
      const entry = registry.resolve(name);
      return entry?.schema ?? null;
    },

    list() {
      const names = new Set<string>(entries.keys());
      if (parent) {
        for (const name of parent.list()) {
          names.add(name);
        }
      }
      return [...names].sort();
    },

    has(name) {
      return entries.has(name) || (parent?.has(name) ?? false);
    },

    extend() {
      return createComponentRegistry(registry);
    },
  };

  return registry;
}
