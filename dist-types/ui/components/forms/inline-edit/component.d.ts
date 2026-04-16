import type { InlineEditConfig } from "./types";
/**
 * InlineEdit component — click-to-edit text field.
 *
 * Toggles between a display mode and an edit mode. Enter or blur saves the
 * value; Escape reverts to the original value when `cancelOnEscape` is enabled.
 */
export declare function InlineEdit({ config }: {
    config: InlineEditConfig;
}): import("react/jsx-runtime").JSX.Element;
