import type { InputConfig, InputControlProps } from "./types";
export declare function InputControl({ inputRef, inputId, name, type, value, checked, placeholder, autoComplete, autoFocus, disabled, readOnly, accept, multiple, list, min, max, step, maxLength, pattern, required, ariaInvalid, ariaDescribedBy, ariaLabel, onChangeText, onChangeChecked, onChangeFiles, onBlur, onFocus, onClick, onKeyDown, onMouseEnter, onMouseLeave, onPointerDown, onPointerUp, onTouchStart, onTouchEnd, className, style, surfaceId, surfaceConfig, itemSurfaceConfig, activeStates, testId, }: InputControlProps): import("react/jsx-runtime").JSX.Element;
export declare function Input({ config }: {
    config: InputConfig;
}): import("react/jsx-runtime").JSX.Element | null;
