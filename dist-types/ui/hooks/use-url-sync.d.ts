export interface UseUrlSyncOptions {
    params: Record<string, string>;
    state: Record<string, unknown>;
    onStateFromUrl: (state: Record<string, string>) => void;
    replace?: boolean;
    enabled: boolean;
}
/** Keep a slice of local state synchronized with URL query parameters. */
export declare function useUrlSync(options: UseUrlSyncOptions): void;
