import type { SelectConfig, SelectControlProps } from "./types";
export declare function SelectControl({ selectRef, selectId, name, value, disabled, required, ariaInvalid, ariaDescribedBy, ariaLabel, onChangeValue, onBlur, onFocus, onClick, onKeyDown, onMouseEnter, onMouseLeave, onPointerDown, onPointerUp, onTouchStart, onTouchEnd, className, style, surfaceId, surfaceConfig, itemSurfaceConfig, activeStates, testId, children, }: SelectControlProps): import("react/jsx-runtime").JSX.Element;
export declare function Select({ config }: {
    config: SelectConfig;
}): import("react/jsx-runtime").JSX.Element | null;
