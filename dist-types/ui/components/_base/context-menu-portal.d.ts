import type { ActionConfig } from "../../actions/types";
export type ContextMenuPortalItem = {
    type?: "item";
    label: string;
    icon?: string;
    action?: ActionConfig;
    variant?: "default" | "destructive";
    disabled?: boolean;
    slots?: Record<string, unknown>;
} | {
    type: "separator";
    slots?: Record<string, unknown>;
} | {
    type: "label";
    text: string;
    slots?: Record<string, unknown>;
};
export interface ContextMenuPortalState {
    x: number;
    y: number;
    context?: Record<string, unknown>;
}
export declare function ContextMenuPortal({ items, state, onClose, slots, idBase, }: {
    items: ContextMenuPortalItem[];
    state: ContextMenuPortalState | null;
    onClose: () => void;
    slots?: Record<string, unknown>;
    idBase?: string;
}): import("react/jsx-runtime").JSX.Element | null;
