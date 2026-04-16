import type { ScrollAreaConfig } from "./types";
/**
 * ScrollArea component — a scrollable container with custom-styled thin scrollbars.
 *
 * Supports vertical, horizontal, or bidirectional scrolling.
 * Scrollbar visibility can be always, hover-only, or auto.
 * Uses scoped runtime CSS for webkit scrollbar pseudo-element styling.
 *
 * @param props.config - The scroll area config from the manifest
 */
export declare function ScrollArea({ config }: {
    config: ScrollAreaConfig;
}): import("react/jsx-runtime").JSX.Element | null;
