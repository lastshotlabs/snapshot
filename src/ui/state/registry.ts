import { atom, createStore } from "jotai";
import type { PrimitiveAtom } from "jotai";
import type { AtomRegistry, JotaiStore } from "./types";

/**
 * Jotai-backed registry for named state atoms.
 */
export class AtomRegistryImpl implements AtomRegistry {
  private readonly atoms = new Map<string, PrimitiveAtom<unknown>>();
  readonly store: JotaiStore;

  constructor(store?: JotaiStore) {
    this.store = store ?? createStore();
  }

  register(id: string): PrimitiveAtom<unknown> {
    const existing = this.atoms.get(id);
    if (existing) return existing;

    const created = atom<unknown>(undefined);
    created.debugLabel = `snapshot:${id}`;
    this.atoms.set(id, created);
    return created;
  }

  get(id: string): PrimitiveAtom<unknown> | undefined {
    return this.atoms.get(id);
  }

  unregister(id: string): void {
    this.atoms.delete(id);
  }

  keys(): string[] {
    return [...this.atoms.keys()];
  }
}
