/**
 * Snapshot plugin system.
 *
 * Plugins extend the component registry, add component groups, and run
 * setup logic after manifest compilation.
 */
import type { z } from "zod";
import type { ManifestConfig } from "./ui/manifest/types";
/**
 * Context passed to plugin setup() hooks.
 */
export interface PluginSetupContext {
    /** Read-only compiled manifest. */
    manifest: Readonly<ManifestConfig>;
    /** Register a custom workflow action handler. */
    registerWorkflowAction: (type: string, handler: (...args: unknown[]) => unknown) => void;
    /** Register a route guard. */
    registerGuard: (name: string, guard: (...args: unknown[]) => unknown) => void;
    /** Set a global state value. */
    setGlobalState: (key: string, value: unknown) => void;
}
/**
 * A component entry in a plugin: the React component + its Zod schema.
 */
export interface PluginComponentEntry {
    component: React.ComponentType<{
        config: Record<string, unknown>;
    }>;
    schema: z.ZodType;
}
/**
 * A component group definition in a plugin.
 */
export interface PluginComponentGroupDefinition {
    description?: string;
    components: Array<Record<string, unknown>>;
}
/**
 * Snapshot plugin interface.
 */
export interface SnapshotPlugin {
    /** Plugin name. Must be unique across all loaded plugins. */
    name: string;
    /** Components to register. Key = type name, value = component + schema. */
    components?: Record<string, PluginComponentEntry>;
    /** Component groups to register. Merged into manifest componentGroups. */
    componentGroups?: Record<string, PluginComponentGroupDefinition>;
    /** Setup hook called after manifest compilation. */
    setup?: (context: PluginSetupContext) => void | Promise<void>;
}
/**
 * Identity function for defining plugins with full type inference.
 *
 * No runtime logic. Exists solely so `const p = definePlugin({...})` gives
 * full autocomplete on the plugin shape.
 *
 * @param plugin - The plugin definition
 * @returns The same plugin definition, typed
 *
 * @example
 * ```ts
 * const myPlugin = definePlugin({
 *   name: 'my-plugin',
 *   components: [{ type: 'my-widget', component: MyWidget, schema: myWidgetSchema }],
 * });
 * ```
 */
export declare function definePlugin(plugin: SnapshotPlugin): SnapshotPlugin;
