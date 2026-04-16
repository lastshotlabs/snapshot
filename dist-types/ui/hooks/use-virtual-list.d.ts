export interface UseVirtualListOptions {
    totalCount: number;
    itemHeight: number;
    overscan: number;
}
export interface UseVirtualListResult {
    containerRef: React.RefObject<HTMLDivElement | null>;
    totalHeight: number;
    startIndex: number;
    endIndex: number;
    offsetTop: number;
    visibleIndices: number[];
}
/** Compute the visible slice for a fixed-height virtualized list container. */
export declare function useVirtualList({ totalCount, itemHeight, overscan, }: UseVirtualListOptions): UseVirtualListResult;
