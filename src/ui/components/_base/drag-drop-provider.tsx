'use client';

import React, {
  useCallback,
  useMemo,
  useRef,
} from "react";
import { atom } from "jotai";
import { useAtomValue, useStore } from "jotai/react";
import {
  DndContext,
  closestCenter,
  useDndSensors,
} from "../../hooks/use-drag-drop";
import type { DragEndEvent } from "../../hooks/use-drag-drop";

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
  insertItem(
    item: unknown,
    options?: { itemId?: string; overId?: string | null },
  ): {
    id: string;
    index: number;
    item: unknown;
    items: unknown[];
  } | null;
  onDrop?(context: {
    item: unknown;
    source: { containerId: string; dragGroup?: string };
    target: { containerId: string; dragGroup?: string };
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

const sharedDragDropAtom = atom<SharedDragDropContextValue | null>(null);
sharedDragDropAtom.debugLabel = "snapshot:shared-drag-drop";

function isDropAllowed(
  source: SharedDragDropContainer,
  target: SharedDragDropContainer,
): boolean {
  if (!source.dragGroup) {
    return false;
  }

  if (target.dropTargets?.includes(source.dragGroup)) {
    return true;
  }

  return !target.dropTargets?.length && target.dragGroup === source.dragGroup;
}

function getTargetContainerId(
  event: DragEndEvent,
): string | null {
  const overData =
    event.over?.data.current as
      | SharedDragDropItemData
      | SharedDragDropContainerData
      | undefined;
  if (!event.over || !overData) {
    return null;
  }

  if (
    overData.kind === "snapshot-shared-dnd-item" ||
    overData.kind === "snapshot-shared-dnd-container"
  ) {
    return overData.containerId;
  }

  return null;
}

/**
 * Shared DnD provider for manifest-driven sortable components.
 * Centralizes drag/drop so list and data-table can reorder locally and
 * transfer items across matching drag groups without each mounting its own
 * disconnected DndContext.
 */
export function SnapshotDragDropProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sensors = useDndSensors();
  const containersRef = useRef(new Map<string, SharedDragDropContainer>());
  const store = useStore();
  const lastValueRef = useRef<SharedDragDropContextValue | null>(null);

  const registerContainer = useCallback((container: SharedDragDropContainer) => {
    containersRef.current.set(container.id, container);
    return () => {
      const current = containersRef.current.get(container.id);
      if (current === container) {
        containersRef.current.delete(container.id);
      }
    };
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const activeData =
        event.active.data.current as SharedDragDropItemData | undefined;
      if (!event.over || !activeData || activeData.kind !== "snapshot-shared-dnd-item") {
        return;
      }

      const source = containersRef.current.get(activeData.containerId);
      const targetContainerId = getTargetContainerId(event);
      const target = targetContainerId
        ? containersRef.current.get(targetContainerId)
        : null;
      if (!source || !target) {
        return;
      }

      const activeId = String(event.active.id);
      const overId =
        event.over.data.current &&
        (event.over.data.current as SharedDragDropItemData | SharedDragDropContainerData)
          .kind === "snapshot-shared-dnd-item"
          ? String(event.over.id)
          : null;

      if (source.id === target.id) {
        if (overId) {
          await source.moveItem(activeId, overId);
        }
        return;
      }

      if (!isDropAllowed(source, target)) {
        return;
      }

      const removed = source.removeItem(activeId);
      if (!removed) {
        return;
      }

      const inserted = target.insertItem(removed.item, {
        itemId: removed.id,
        overId,
      });
      if (!inserted) {
        source.insertItem(removed.item, { itemId: removed.id });
        return;
      }

      await target.onDrop?.({
        item: removed.item,
        source: { containerId: source.id, dragGroup: source.dragGroup },
        target: { containerId: target.id, dragGroup: target.dragGroup },
        index: inserted.index,
        items: inserted.items,
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ registerContainer }),
    [registerContainer],
  );

  if (lastValueRef.current !== value) {
    store.set(sharedDragDropAtom, value);
    lastValueRef.current = value;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}

export function useSharedDragDrop(): SharedDragDropContextValue | null {
  return useAtomValue(sharedDragDropAtom);
}

export type { SharedDragDropContainerData, SharedDragDropItemData };
