import type { PopoverConfig } from "./types";
/**
 * Floating panel component triggered by a button-like control.
 *
 * Uses the shared floating panel primitive, applies canonical slot styling to trigger and content
 * surfaces, and publishes `{ isOpen }` when an `id` is configured.
 */
export declare function Popover({ config }: {
    config: PopoverConfig;
}): import("react/jsx-runtime").JSX.Element | null;
