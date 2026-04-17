import type { ButtonConfig, ButtonControlProps } from "./types";
export declare function ButtonControl({ children, type, variant, size, disabled, fullWidth, onClick, onKeyDown, onFocus, onBlur, onPointerDown, onPointerUp, onPointerEnter, onPointerLeave, onTouchStart, onTouchEnd, className, style, buttonRef, surfaceId, surfaceConfig, itemSurfaceConfig, testId, ariaLabel, ariaDescribedBy, ariaLive, ariaPressed, ariaChecked, ariaCurrent, ariaSelected, ariaExpanded, ariaHasPopup, role, tabIndex, title, activeStates, }: ButtonControlProps): import("react/jsx-runtime").JSX.Element;
export declare function Button({ config }: {
    config: ButtonConfig;
}): import("react/jsx-runtime").JSX.Element | null;
