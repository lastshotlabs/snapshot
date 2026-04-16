import type { ReactNode } from "react";
import type { ActionConfig } from "./types";
type ToastVariant = "success" | "error" | "warning" | "info";
interface ToastUndoConfig {
    label: string;
    action: ActionConfig;
    duration: number;
}
/** Resolved toast entry stored in the runtime queue. */
export interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
    duration: number;
    icon?: string;
    color?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    undo?: ToastUndoConfig;
}
/** User-facing toast options accepted by the toast manager. */
export interface ShowToastOptions {
    message: string;
    variant?: ToastVariant;
    duration?: number;
    icon?: string;
    color?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    undo?: {
        label?: string;
        action: ActionConfig;
        duration?: number;
    };
}
export declare const toastQueueAtom: import("jotai").PrimitiveAtom<ToastItem[]> & {
    init: ToastItem[];
};
/** Imperative API for enqueueing and dismissing transient toast messages. */
export interface ToastManager {
    show: (options: ShowToastOptions) => string;
    dismiss: (id: string) => void;
}
/** Return the toast manager bound to the active manifest runtime configuration. */
export declare function useToastManager(): ToastManager;
/** Render the active toast queue using runtime-configured placement defaults. */
export declare function ToastContainer(): ReactNode;
export {};
