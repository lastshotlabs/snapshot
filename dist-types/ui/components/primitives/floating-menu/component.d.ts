import { type CSSProperties, type ReactNode, type RefObject } from "react";
import { type RuntimeSurfaceState } from "../../_base/style-surfaces";
import type { FloatingMenuConfig } from "./types";
type SurfaceConfig = Record<string, unknown>;
export interface FloatingPanelProps {
    open: boolean;
    onClose: () => void;
    containerRef: RefObject<HTMLElement | null>;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    animate?: boolean;
    minWidth?: string;
    role?: string;
    dataAttributes?: Record<string, string>;
    style?: CSSProperties;
    className?: string;
    surfaceId?: string;
    slot?: SurfaceConfig;
    activeStates?: RuntimeSurfaceState[];
    testId?: string;
    children: ReactNode;
}
export declare function FloatingPanel({ open, onClose, containerRef, side, align, animate: enableAnimation, minWidth, role, dataAttributes, style, className, surfaceId, slot, activeStates, testId, children, }: FloatingPanelProps): import("react/jsx-runtime").JSX.Element | null;
export declare function FloatingMenu({ config }: {
    config: FloatingMenuConfig;
}): import("react/jsx-runtime").JSX.Element;
export interface MenuItemProps {
    label: string;
    icon?: string;
    onClick?: () => void;
    disabled?: boolean;
    destructive?: boolean;
    role?: string;
    active?: boolean;
    current?: boolean;
    selected?: boolean;
    style?: CSSProperties;
    className?: string;
    surfaceId?: string;
    slot?: SurfaceConfig;
    labelSlot?: SurfaceConfig;
    iconSlot?: SurfaceConfig;
    tabIndex?: number;
    buttonRef?: RefObject<HTMLButtonElement | null> | ((node: HTMLButtonElement | null) => void);
}
export declare function MenuItem({ label, icon, onClick, disabled, destructive, role, active, current, selected, style, className, surfaceId, slot, labelSlot, iconSlot, tabIndex, buttonRef, }: MenuItemProps): import("react/jsx-runtime").JSX.Element;
export declare function MenuSeparator({ surfaceId, slot, }: {
    surfaceId?: string;
    slot?: SurfaceConfig;
}): import("react/jsx-runtime").JSX.Element;
export declare function MenuLabel({ text, surfaceId, slot, }: {
    text: string;
    surfaceId?: string;
    slot?: SurfaceConfig;
}): import("react/jsx-runtime").JSX.Element;
export declare function FloatingMenuStyles(): null;
export {};
