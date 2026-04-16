import React from "react";
export interface SharedDragDropContainer {
    id: string;
    dragGroup?: string;
    dropTargets?: string[];
    moveItem(activeId: string, overId: string): Promise<unknown> | unknown;
    removeItem(itemId: string): {
        id: string;
        index: number;
        item: unknown;
        items: unknown[];
    } | null;
    insertItem(item: unknown, options?: {
        itemId?: string;
        overId?: string | null;
    }): {
        id: string;
        index: number;
        item: unknown;
        items: unknown[];
    } | null;
    onDrop?(context: {
        item: unknown;
        source: {
            containerId: string;
            dragGroup?: string;
        };
        target: {
            containerId: string;
            dragGroup?: string;
        };
        index: number;
        items: unknown[];
    }): Promise<void> | void;
}
interface SharedDragDropItemData {
    kind: "snapshot-shared-dnd-item";
    containerId: string;
}
interface SharedDragDropContainerData {
    kind: "snapshot-shared-dnd-container";
    containerId: string;
}
interface SharedDragDropContextValue {
    registerContainer: (container: SharedDragDropContainer) => () => void;
}
/**
 * Shared DnD provider for manifest-driven sortable components.
 * Centralizes drag/drop so list and data-table can reorder locally and
 * transfer items across matching drag groups without each mounting its own
 * disconnected DndContext.
 */
export declare function SnapshotDragDropProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useSharedDragDrop(): SharedDragDropContextValue | null;
export type { SharedDragDropContainerData, SharedDragDropItemData };
