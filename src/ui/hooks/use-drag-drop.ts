/**
 * Shared drag-and-drop utilities built on @dnd-kit.
 *
 * Provides reusable DnD context, sortable items, and drag overlay
 * for config-driven components that support reordering (kanban, list, tree-view).
 */

import {
  DndContext,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export {
  // Context & providers
  DndContext,
  SortableContext,
  DragOverlay,
  // Strategies
  closestCenter,
  rectIntersection,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  // Hooks
  useSortable,
  useDroppable,
  useSensor,
  useSensors,
  // Sensors
  PointerSensor,
  KeyboardSensor,
  // Utilities
  sortableKeyboardCoordinates,
  arrayMove,
  CSS,
};

export type { DragStartEvent, DragEndEvent, DragOverEvent };

/**
 * Pre-configured sensor setup for pointer + keyboard DnD.
 * Pointer requires 5px distance to activate (prevents click hijacking).
 * Keyboard uses standard coordinates for arrow key navigation.
 */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

/**
 * CSS transform helper for sortable items.
 * Converts the dnd-kit transform into a CSS transform string.
 */
export function getSortableStyle(
  transform: ReturnType<typeof useSortable>["transform"],
  transition: ReturnType<typeof useSortable>["transition"],
  isDragging: boolean,
): React.CSSProperties {
  return {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };
}
