/** Options for loading additional items when a sentinel approaches the viewport. */
export interface UseInfiniteScrollOptions {
    hasNextPage: boolean;
    isLoading: boolean;
    loadNextPage: () => void;
    threshold?: number;
}
/**
 * Observe a sentinel element and load the next page when it enters the viewport.
 */
export declare function useInfiniteScroll({ hasNextPage, isLoading, loadNextPage, threshold, }: UseInfiniteScrollOptions): import("react").RefObject<HTMLDivElement | null>;
