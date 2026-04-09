import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback } from "react";

/**
 * Atom holding the stack of currently open modal ids.
 * The last element is the topmost modal.
 */
export const modalStackAtom = atom<string[]>([]);
export const modalPayloadAtom = atom<Record<string, unknown>>({});

/**
 * Return type of useModalManager.
 */
export interface ModalManager {
  /** Open a modal by id. If already open, moves it to the top of the stack. */
  open: (id: string, payload?: unknown) => void;
  /** Close a modal by id, or close the topmost modal if no id is provided. */
  close: (id?: string) => void;
  /** Check if a modal is currently open. */
  isOpen: (id: string) => boolean;
  /** Read the payload for a modal/drawer id. */
  getPayload: (id: string) => unknown;
  /** The current modal stack (bottom to top). */
  stack: readonly string[];
}

/**
 * Hook to manage modal open/close state via a Jotai atom stack.
 * Provides open, close, isOpen, and the current stack.
 *
 * @returns A ModalManager with methods to control the modal stack
 *
 * @example
 * ```tsx
 * const { open, close, isOpen, stack } = useModalManager()
 * open('edit-user')
 * close('edit-user')
 * close() // closes topmost
 * ```
 */
export function useModalManager(): ModalManager {
  const [stack, setStack] = useAtom(modalStackAtom);
  const [payloads, setPayloads] = useAtom(modalPayloadAtom);

  const open = useCallback(
    (id: string, payload?: unknown) => {
      setStack((prev) => [...prev.filter((m) => m !== id), id]);
      if (payload !== undefined) {
        setPayloads((prev) => ({
          ...prev,
          [id]: payload,
        }));
      }
    },
    [setPayloads, setStack],
  );

  const close = useCallback(
    (id?: string) => {
      let removedId: string | undefined;
      setStack((prev) => {
        removedId = id ?? prev[prev.length - 1];
        return id ? prev.filter((m) => m !== id) : prev.slice(0, -1);
      });
      if (removedId) {
        setPayloads((prev) => {
          const next = { ...prev };
          delete next[removedId!];
          return next;
        });
      }
    },
    [setPayloads, setStack],
  );

  const isOpen = useCallback((id: string) => stack.includes(id), [stack]);
  const getPayload = useCallback((id: string) => payloads[id], [payloads]);

  return { open, close, isOpen, getPayload, stack };
}
