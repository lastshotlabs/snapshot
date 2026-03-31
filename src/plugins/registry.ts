import type { SnapshotPlugin } from "./types";

/**
 * Validates that all declared dependencies exist in the plugin set.
 * Throws on the first missing dependency found.
 */
export function validatePlugins(plugins: readonly SnapshotPlugin[]): void {
  const names = new Set(plugins.map((p) => p.name));

  // Check for duplicate names
  if (names.size !== plugins.length) {
    const seen = new Set<string>();
    for (const p of plugins) {
      if (seen.has(p.name)) {
        throw new Error(`[snapshot] Duplicate plugin name: "${p.name}"`);
      }
      seen.add(p.name);
    }
  }

  // Check all dependencies exist
  for (const plugin of plugins) {
    for (const dep of plugin.dependencies ?? []) {
      if (!names.has(dep)) {
        throw new Error(
          `[snapshot] Plugin "${plugin.name}" depends on "${dep}" which is not registered`,
        );
      }
    }
  }
}

/**
 * Topological sort of plugins by their declared dependencies.
 * Ensures every plugin runs after its dependencies.
 * Throws on circular dependencies.
 */
export function sortPlugins(plugins: readonly SnapshotPlugin[]): SnapshotPlugin[] {
  validatePlugins(plugins);

  const byName = new Map(plugins.map((p) => [p.name, p]));
  const sorted: SnapshotPlugin[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(plugin: SnapshotPlugin): void {
    if (visited.has(plugin.name)) return;
    if (visiting.has(plugin.name)) {
      throw new Error(`[snapshot] Circular plugin dependency detected: "${plugin.name}"`);
    }

    visiting.add(plugin.name);

    for (const dep of plugin.dependencies ?? []) {
      const depPlugin = byName.get(dep)!;
      visit(depPlugin);
    }

    visiting.delete(plugin.name);
    visited.add(plugin.name);
    sorted.push(plugin);
  }

  for (const plugin of plugins) {
    visit(plugin);
  }

  return sorted;
}
