'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { arrayMove } from "../../hooks/use-drag-drop";

interface ReorderEntry<T> {
  id: string;
  item: T;
}

function areEntriesEqual<T>(
  previous: ReorderEntry<T>[],
  next: ReorderEntry<T>[],
): boolean {
  return (
    previous.length === next.length &&
    previous.every(
      (entry, index) =>
        entry.id === next[index]?.id && Object.is(entry.item, next[index]?.item),
    )
  );
}

function areItemsEqual<T>(
  previous: T[] | null,
  next: T[],
  getKey?: (item: T) => string | number | null | undefined,
): boolean {
  if (previous == null || previous.length !== next.length) {
    return false;
  }

  return previous.every((item, index) => {
    const nextItem = next[index];
    const previousKey = getKey?.(item);
    const nextKey = nextItem !== undefined ? getKey?.(nextItem) : undefined;
    if (previousKey != null || nextKey != null) {
      return previousKey === nextKey;
    }

    if (typeof item === "object" && item !== null) {
      return Object.is(item, nextItem);
    }

    return Object.is(item, nextItem);
  });
}

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

function getObjectId(
  value: object,
  objectIds: WeakMap<object, string>,
  nextId: React.MutableRefObject<number>,
): string {
  const existing = objectIds.get(value);
  if (existing) {
    return existing;
  }

  const created = `snapshot-dnd-${nextId.current++}`;
  objectIds.set(value, created);
  return created;
}

function buildEntries<T>(
  items: T[],
  getKey: ((item: T) => string | number | null | undefined) | undefined,
  objectIds: WeakMap<object, string>,
  nextId: React.MutableRefObject<number>,
  previous: ReorderEntry<T>[] = [],
): ReorderEntry<T>[] {
  const keyedEntries = new Map<string, ReorderEntry<T>[]>();
  const primitiveEntries = new Map<string, ReorderEntry<T>[]>();
  const objectEntries = new WeakMap<object, ReorderEntry<T>>();

  for (const entry of previous) {
    const explicitKey = getKey?.(entry.item);
    if (explicitKey != null) {
      const key = String(explicitKey);
      const bucket = keyedEntries.get(key) ?? [];
      bucket.push(entry);
      keyedEntries.set(key, bucket);
      continue;
    }

    if (typeof entry.item === "object" && entry.item !== null) {
      objectEntries.set(entry.item as object, entry);
      continue;
    }

    const key = `${typeof entry.item}:${String(entry.item)}`;
    const bucket = primitiveEntries.get(key) ?? [];
    bucket.push(entry);
    primitiveEntries.set(key, bucket);
  }

  return items.map((item, index) => {
    const explicitKey = getKey?.(item);
    if (explicitKey != null) {
      const bucket = keyedEntries.get(String(explicitKey));
      const match = bucket?.shift();
      return match ?? { id: String(explicitKey), item };
    }

    if (typeof item === "object" && item !== null) {
      const match = objectEntries.get(item);
      if (match) {
        return { id: match.id, item };
      }

      return { id: getObjectId(item, objectIds, nextId), item };
    }

    const primitiveKey = `${typeof item}:${String(item)}`;
    const bucket = primitiveEntries.get(primitiveKey);
    const match = bucket?.shift();
    return (
      match ?? {
        id: `snapshot-dnd-primitive-${index}-${String(item)}`,
        item,
      }
    );
  });
}

/**
 * Shared sortable state for sortable components that support local reordering
 * and cross-component drag-and-drop.
 */
export function useReorderable<T>({
  items,
  getKey,
  onReorder,
}: UseReorderableOptions<T>) {
  const objectIds = useRef(new WeakMap<object, string>());
  const nextId = useRef(0);
  const getKeyRef = useRef(getKey);
  getKeyRef.current = getKey;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;
  const [entries, setEntries] = useState<ReorderEntry<T>[]>(() =>
    buildEntries(items, getKeyRef.current, objectIds.current, nextId),
  );
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const syncedItemsRef = useRef(items);

  useEffect(() => {
    if (areItemsEqual(syncedItemsRef.current, items, getKeyRef.current)) {
      return;
    }

    syncedItemsRef.current = items;
    setEntries((previous) => {
      const nextEntries = buildEntries(
        items,
        getKeyRef.current,
        objectIds.current,
        nextId,
        previous,
      );
      return areEntriesEqual(previous, nextEntries) ? previous : nextEntries;
    });
  }, [items]);

  const orderedItems = useMemo(
    () => entries.map((entry) => entry.item),
    [entries],
  );
  const itemIds = useMemo(
    () => entries.map((entry) => entry.id),
    [entries],
  );

  const moveItem = useCallback(
    async (activeId: string, overId: string) => {
      const currentEntries = entriesRef.current;
      const oldIndex = currentEntries.findIndex((entry) => entry.id === activeId);
      const newIndex = currentEntries.findIndex((entry) => entry.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return null;
      }

      const reorderedEntries = arrayMove(currentEntries, oldIndex, newIndex);
      entriesRef.current = reorderedEntries;
      setEntries(reorderedEntries);

      const context = {
        oldIndex,
        newIndex,
        item: currentEntries[oldIndex]!.item,
        items: reorderedEntries.map((entry) => entry.item),
      };
      await onReorderRef.current?.(context);
      return context;
    },
    [],
  );

  const removeItem = useCallback(
    (itemId: string): RemoveItemResult<T> | null => {
      const currentEntries = entriesRef.current;
      const index = currentEntries.findIndex((entry) => entry.id === itemId);
      if (index === -1) {
        return null;
      }

      const entry = currentEntries[index]!;
      const nextEntries = currentEntries.filter(
        (candidate) => candidate.id !== itemId,
      );
      entriesRef.current = nextEntries;
      setEntries(nextEntries);
      return {
        id: entry.id,
        index,
        item: entry.item,
        items: nextEntries.map((candidate) => candidate.item),
      };
    },
    [],
  );

  const insertItem = useCallback(
    (item: T, options?: { itemId?: string; overId?: string | null }) => {
      const nextEntry: ReorderEntry<T> = {
        id:
          options?.itemId ??
          (() => {
            const explicitKey = getKeyRef.current?.(item);
            if (explicitKey != null) {
              return String(explicitKey);
            }
            if (typeof item === "object" && item !== null) {
              return getObjectId(item, objectIds.current, nextId);
            }
            return `snapshot-dnd-insert-${nextId.current++}`;
          })(),
        item,
      };

      let nextEntries = [...entriesRef.current];
      const existingIndex = nextEntries.findIndex(
        (entry) => entry.id === nextEntry.id,
      );
      if (existingIndex !== -1) {
        nextEntries.splice(existingIndex, 1);
      }

      const overIndex =
        options?.overId != null
          ? nextEntries.findIndex((entry) => entry.id === options.overId)
          : -1;
      const index = overIndex === -1 ? nextEntries.length : overIndex;
      nextEntries.splice(index, 0, nextEntry);
      entriesRef.current = nextEntries;
      setEntries(nextEntries);

      return {
        id: nextEntry.id,
        index,
        item,
        items: nextEntries.map((entry) => entry.item),
      } satisfies InsertItemResult<T>;
    },
    [],
  );

  return {
    orderedItems,
    itemIds,
    moveItem,
    removeItem,
    insertItem,
  };
}
