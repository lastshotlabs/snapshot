export interface ReorderContext<T> {
    oldIndex: number;
    newIndex: number;
    item: T;
    items: T[];
}
export interface RemoveItemResult<T> {
    id: string;
    index: number;
    item: T;
    items: T[];
}
export interface InsertItemResult<T> {
    id: string;
    index: number;
    item: T;
    items: T[];
}
export interface UseReorderableOptions<T> {
    items: T[];
    getKey?: (item: T) => string | number | null | undefined;
    onReorder?: (context: ReorderContext<T>) => void | Promise<void>;
}
/**
 * Shared sortable state for manifest-driven components that support local reordering
 * and cross-component drag-and-drop.
 */
export declare function useReorderable<T>({ items, getKey, onReorder, }: UseReorderableOptions<T>): {
    orderedItems: T[];
    itemIds: string[];
    moveItem: (activeId: string, overId: string) => Promise<{
        oldIndex: number;
        newIndex: number;
        item: T;
        items: T[];
    } | null>;
    removeItem: (itemId: string) => RemoveItemResult<T> | null;
    insertItem: (item: T, options?: {
        itemId?: string;
        overId?: string | null;
    }) => {
        id: string;
        index: number;
        item: T;
        items: T[];
    };
};
