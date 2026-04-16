import type { ListConfig } from "./types";
/**
 * List component — renders a vertical list of items with optional
 * icons, descriptions, badges, and click actions.
 *
 * Supports both static items (via `items` config) and dynamic items
 * fetched from an API endpoint (via `data` config). Provides loading
 * skeletons and an empty state message.
 *
 * @param props.config - The list config from the manifest
 */
export declare function ListComponent({ config }: {
    config: ListConfig;
}): import("react/jsx-runtime").JSX.Element;
