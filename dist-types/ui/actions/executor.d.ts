import type { ActionExecuteFn } from "./types";
import { SnapshotApiProvider } from "../state";
/** Backward-compatible provider shim that writes the API client into Jotai state. */
export declare const SnapshotApiContext: {
    readonly Provider: typeof SnapshotApiProvider;
    readonly displayName: "SnapshotApiProvider";
};
/**
 * Return the action executor bound to the active runtime, registries, overlays,
 * workflows, and optional API client.
 */
export declare function useActionExecutor(): ActionExecuteFn;
