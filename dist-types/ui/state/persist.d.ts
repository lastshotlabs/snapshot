export type PersistStorage = "localStorage" | "sessionStorage";
/** Build the storage key used for persisted Snapshot state entries. */
export declare function toPersistedStateKey(key: string): string;
/** Read and JSON-decode a persisted state value, returning `undefined` on failure or absence. */
export declare function readPersistedState(key: string, storage: PersistStorage): unknown;
/** Serialize and store a persisted state value, ignoring browser storage failures. */
export declare function writePersistedState(key: string, value: unknown, storage: PersistStorage): void;
/** Remove a persisted state value from the selected browser storage area. */
export declare function clearPersistedState(key: string, storage: PersistStorage): void;
