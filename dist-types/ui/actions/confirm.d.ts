import type { ReactNode } from "react";
/** Internal confirm-dialog request stored in the atom-backed manager queue. */
export interface ConfirmRequest {
    title?: string;
    message?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    requireInput?: string;
    resolve: (confirmed: boolean) => void;
}
/** Options accepted when opening a confirmation dialog. */
export type ConfirmOptions = Omit<ConfirmRequest, "resolve">;
export declare const confirmAtom: import("jotai").PrimitiveAtom<ConfirmRequest | null> & {
    init: ConfirmRequest | null;
};
/** Imperative API for opening a confirmation dialog from manifest actions or custom UI. */
export interface ConfirmManager {
    show: (options: ConfirmOptions) => Promise<boolean>;
}
/** Return the shared confirmation manager for the current Snapshot UI tree. */
export declare function useConfirmManager(): ConfirmManager;
/** Render the global confirmation dialog for requests queued through `useConfirmManager`. */
export declare function ConfirmDialog(): ReactNode;
