/**
 * Atom holding the stack of currently open modal ids.
 * The last element is the topmost modal.
 */
export declare const modalStackAtom: import("jotai").PrimitiveAtom<string[]> & {
    init: string[];
};
export declare const modalPayloadAtom: import("jotai").PrimitiveAtom<Record<string, unknown>> & {
    init: Record<string, unknown>;
};
export declare const modalResultTargetAtom: import("jotai").PrimitiveAtom<Record<string, string>> & {
    init: Record<string, string>;
};
export declare const modalResultAtom: import("jotai").PrimitiveAtom<Record<string, unknown>> & {
    init: Record<string, unknown>;
};
/**
 * Return type of useModalManager.
 */
export interface ModalManager {
    /** Open a modal by id. If already open, moves it to the top of the stack. */
    open: (id: string, payload?: unknown, resultTarget?: string) => void;
    /** Close a modal by id, or close the topmost modal if no id is provided. */
    close: (id?: string, result?: unknown) => void;
    /** Check if a modal is currently open. */
    isOpen: (id: string) => boolean;
    /** Read the payload for a modal/drawer id. */
    getPayload: (id: string) => unknown;
    /** Read the configured result target for a modal/drawer id. */
    getResultTarget: (id: string) => string | undefined;
    /** Read the most recent close result for a modal/drawer id. */
    getResult: (id: string) => unknown;
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
export declare function useModalManager(): ModalManager;
