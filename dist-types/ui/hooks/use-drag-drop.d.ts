/**
 * Shared drag-and-drop utilities built on @dnd-kit.
 *
 * Provides reusable DnD context, sortable items, and drag overlay
 * for config-driven components that support reordering (kanban, list, tree-view).
 */
import { DndContext, closestCenter, rectIntersection, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export { DndContext, SortableContext, DragOverlay, closestCenter, rectIntersection, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, useDroppable, useSensor, useSensors, PointerSensor, KeyboardSensor, sortableKeyboardCoordinates, arrayMove, CSS, };
export type { DragStartEvent, DragEndEvent, DragOverEvent };
/**
 * Pre-configured sensor setup for pointer + keyboard DnD.
 * Pointer requires 5px distance to activate (prevents click hijacking).
 * Keyboard uses standard coordinates for arrow key navigation.
 */
export declare function useDndSensors(): import("@dnd-kit/core").SensorDescriptor<import("@dnd-kit/core").SensorOptions>[];
/**
 * CSS transform helper for sortable items.
 * Converts the dnd-kit transform into a CSS transform string.
 */
export declare function getSortableStyle(transform: ReturnType<typeof useSortable>["transform"], transition: ReturnType<typeof useSortable>["transition"], isDragging: boolean): React.CSSProperties;
