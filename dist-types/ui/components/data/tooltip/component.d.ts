import type { TooltipConfig } from "./types";
/**
 * Tooltip component — wraps child components and shows informational
 * text on hover with configurable placement and delay.
 *
 * Uses inverted colors (foreground bg, background text) for contrast.
 * Supports FromRef for dynamic tooltip text and CSS transitions for
 * smooth fade-in/out.
 *
 * @param props.config - The tooltip config from the manifest
 */
export declare function TooltipComponent({ config }: {
    config: TooltipConfig;
}): import("react/jsx-runtime").JSX.Element;
