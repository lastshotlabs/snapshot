import { atom, createStore } from "jotai";
import type { PrimitiveAtom } from "jotai";
import type { AtomRegistry, JotaiStore } from "./types";

/**
 * Jotai-backed atom registry that maps component ids to their published atoms.
 * Each registry owns a Jotai store so page-level and app-level contexts are isolated.
 *
 * @example
 * ```ts
 * const registry = new AtomRegistryImpl()
 * const a = registry.register('users-table')
 * registry.store.set(a, { selected: { id: 1 } })
 * registry.store.get(a) // → { selected: { id: 1 } }
 * ```
 */
export class AtomRegistryImpl implements AtomRegistry {
  private readonly atoms = new Map<string, PrimitiveAtom<unknown>>();
  readonly store: JotaiStore;

  constructor(store?: JotaiStore) {
    this.store = store ?? createStore();
  }

  /** Register an atom for a component id. Idempotent — returns existing atom if already registered. */
  register(id: string): PrimitiveAtom<unknown> {
    const existing = this.atoms.get(id);
    if (existing) return existing;

    const a = atom<unknown>(undefined);
    // Debug label for Jotai devtools
    a.debugLabel = `snapshot:${id}`;
    this.atoms.set(id, a);
    return a;
  }

  /** Get the atom for a component id. Returns undefined if not registered. */
  get(id: string): PrimitiveAtom<unknown> | undefined {
    return this.atoms.get(id);
  }

  /** Remove a component's atom. Called on unmount. */
  unregister(id: string): void {
    this.atoms.delete(id);
  }

  /** Get all registered component ids. For debugging/dev tools. */
  keys(): string[] {
    return [...this.atoms.keys()];
  }
}
