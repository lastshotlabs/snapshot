import type { KanbanConfig } from "./types";
/**
 * Config-driven Kanban board with optional drag-and-drop.
 *
 * When `sortable: true`, cards can be dragged between columns.
 * On drop, the `reorderAction` is dispatched with the card's id,
 * the target column key, and the new position index.
 *
 * @param props - Component props containing the Kanban configuration
 */
export declare function Kanban({ config }: {
    config: KanbanConfig;
}): import("react/jsx-runtime").JSX.Element | null;
