import type { AtomRegistry, JotaiStore, StateAtom } from "./types";
export declare function extractStateDependencies(expression: string): string[];
export declare function createComputedAtom(computeExpr: string, registry: AtomRegistry): StateAtom;
/**
 * Jotai-backed registry for named state atoms.
 */
export declare class AtomRegistryImpl implements AtomRegistry {
    private readonly atoms;
    readonly store: JotaiStore;
    constructor(store?: JotaiStore);
    register(id: string, atomOverride?: StateAtom): StateAtom;
    get(id: string): StateAtom | undefined;
    unregister(id: string): void;
    keys(): string[];
}
