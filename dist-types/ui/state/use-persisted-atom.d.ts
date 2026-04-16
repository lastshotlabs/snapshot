import type { PrimitiveAtom } from "jotai";
import { type PersistStorage } from "./persist";
/** Bind a primitive atom to browser storage so its value survives page reloads. */
export declare function usePersistedAtom<T>(sourceAtom: PrimitiveAtom<T>, key: string, storage: PersistStorage): [T, (value: T) => void];
