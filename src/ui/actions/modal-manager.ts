import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback } from "react";

/**
 * Atom holding the stack of currently open modal ids.
 * The last element is the topmost modal.
 */
export const modalStackAtom = atom<string[]>([]);

/**
 * Return type of useModalManager.
 */
export interface ModalManager {
  /** Open a modal by id. If already open, moves it to the top of the stack. */
  open: (id: string) => void;
  /** Close a modal by id, or close the topmost modal if no id is provided. */
  close: (id?: string) => void;
  /** Check if a modal is currently open. */
  isOpen: (id: string) => boolean;
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

  const open = useCallback(
    (id: string) => {
      setStack((prev) => [...prev.filter((m) => m !== id), id]);
    },
    [setStack],
  );

  const close = useCallback(
    (id?: string) => {
      setStack((prev) =>
        id ? prev.filter((m) => m !== id) : prev.slice(0, -1),
      );
    },
    [setStack],
  );

  const isOpen = useCallback((id: string) => stack.includes(id), [stack]);

  return { open, close, isOpen, stack };
}
