import { useEffect, useMemo } from "react";
import { atom, useAtom, useAtomValue, useStore } from "jotai";

// ── Page value registry ──────────────────────────────────────────────────────

const pageValuesAtom = atom<Map<string, unknown>>(new Map());

/**
 * Publish a value to the page context under the given ID.
 */
export function usePublishValue(id: string | undefined, value: unknown): void {
  const [, setValues] = useAtom(pageValuesAtom);

  useEffect(() => {
    if (!id) return;

    setValues((prev) => {
      if (prev.get(id) === value) return prev;
      const next = new Map(prev);
      next.set(id, value);
      return next;
    });

    return () => {
      setValues((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };
  }, [id, value, setValues]);
}

/**
 * Subscribe to a single page context value by ID.
 */
export function usePageValue(id: string): unknown {
  const values = useAtomValue(pageValuesAtom);
  return values.get(id);
}

/**
 * Subscribe to multiple page context values by ID.
 */
export function usePageValues(ids: string[]): Map<string, unknown> {
  const values = useAtomValue(pageValuesAtom);

  return useMemo(() => {
    const result = new Map<string, unknown>();
    for (const id of ids) {
      if (values.has(id)) {
        result.set(id, values.get(id));
      }
    }
    return result;
  }, [values, ids]);
}

// ── Modal state ──────────────────────────────────────────────────────────────

const openModalsAtom = atom<Map<string, Record<string, unknown> | undefined>>(new Map());

/**
 * Hook to read modal open state. Used by the renderer to pass isOpen/onClose to Modal components.
 */
export function useModalState(id: string): {
  isOpen: boolean;
  content: Record<string, unknown> | undefined;
} {
  const modals = useAtomValue(openModalsAtom);
  return { isOpen: modals.has(id), content: modals.get(id) };
}

// ── Imperative accessors (for ActionContext) ─────────────────────────────────
// These use the jotai store directly so they work outside React render context
// (e.g. inside executeAction which is an async function, not a hook).

/**
 * Returns imperative getters/setters for page values and modals.
 * Call this inside a React component to get the store reference,
 * then pass the returned functions to ActionContext.
 */
export function usePageContextAccessors() {
  const store = useStore();

  return useMemo(
    () => ({
      getPageValue: (id: string): unknown => {
        const values = store.get(pageValuesAtom);
        return values.get(id);
      },
      setPageValue: (id: string, value: unknown): void => {
        store.set(pageValuesAtom, (prev) => {
          const next = new Map(prev);
          next.set(id, value);
          return next;
        });
      },
      openModal: (id: string, content?: Record<string, unknown>): void => {
        store.set(openModalsAtom, (prev) => {
          const next = new Map(prev);
          next.set(id, content);
          return next;
        });
      },
      closeModal: (id: string): void => {
        store.set(openModalsAtom, (prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      },
    }),
    [store],
  );
}
