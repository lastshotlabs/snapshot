import { type ReactNode } from "react";
import type { ApiClient } from "../../api/client";
export declare const apiClientAtom: import("jotai").PrimitiveAtom<ApiClient | null> & {
    init: ApiClient | null;
};
/** Read the active API client from the app-scope Jotai store. */
export declare function useApiClient(): ApiClient | null;
/**
 * Backward-compatible provider shim for tests and external wrappers.
 * This writes the client into the shared Jotai store instead of React context.
 */
export declare function SnapshotApiProvider({ value, children, }: {
    value: ApiClient | null;
    children?: ReactNode;
}): import("react").FunctionComponentElement<import("react").FragmentProps>;
