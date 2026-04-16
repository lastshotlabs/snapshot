import type { TextareaConfig, TextareaControlProps } from "./types";
export declare function TextareaControl({ textareaRef, textareaId, name, value, rows, placeholder, disabled, readOnly, maxLength, required, resize, ariaInvalid, ariaDescribedBy, ariaLabel, onChangeText, onBlur, className, style, surfaceId, surfaceConfig, itemSurfaceConfig, activeStates, testId, }: TextareaControlProps): import("react/jsx-runtime").JSX.Element;
export declare function Textarea({ config }: {
    config: TextareaConfig;
}): import("react/jsx-runtime").JSX.Element | null;
