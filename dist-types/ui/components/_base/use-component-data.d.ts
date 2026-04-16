import type { FromRef } from "../../context/types";
import { type ResourceRef } from "../../manifest/resources";
/**
 * Result returned by `useComponentData`.
 * Provides the fetched data, loading/error states, and a refetch function.
 */
export interface ComponentDataResult {
    /** The response data, or null if not yet loaded or errored. */
    data: Record<string, unknown> | null;
    /** Whether the initial fetch is in progress. */
    isLoading: boolean;
    /** Error from the last fetch attempt, or null. */
    error: Error | null;
    /** Manually re-fetch the data. */
    refetch: () => void;
}
export interface ComponentDataOptions {
    poll?: {
        interval: number;
        pauseWhenHidden?: boolean;
    };
}
/**
 * Shared data-fetching hook for config-driven components.
 *
 * Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint,
 * resolves any `FromRef` values in params via `useSubscribe`, and fetches data
 * using the app-scope API client.
 *
 * When the API client is not available (e.g., in tests or before ManifestApp provides it),
 * the hook returns a loading state without throwing.
 *
 * @param dataConfig - Endpoint string or FromRef. Example: `"GET /api/stats/revenue"`
 * @param params - Optional query parameters, may contain FromRef values
 * @returns Data, loading state, error, and refetch function
 */
export declare function useComponentData(dataConfig: string | FromRef | ResourceRef, params?: Record<string, unknown | FromRef>, options?: ComponentDataOptions): ComponentDataResult;
