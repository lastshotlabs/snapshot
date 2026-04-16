import type { z } from "zod";
import type { feedSchema } from "./schema";
/**
 * Inferred type for the Feed component config (from Zod schema).
 */
export type FeedConfig = z.input<typeof feedSchema>;
/**
 * A single resolved feed item for rendering.
 */
export interface FeedItem {
    /** Unique key for React list rendering. */
    key: string | number;
    /** Avatar URL, or undefined. */
    avatar: string | undefined;
    /** Display title. */
    title: string;
    /** Display description, or undefined. */
    description: string | undefined;
    /** ISO timestamp string, or undefined. */
    timestamp: string | undefined;
    /** Badge value, or undefined. */
    badgeValue: string | undefined;
    /** Resolved badge semantic color name, or undefined. */
    badgeColor: string | undefined;
    /** Raw source item. */
    raw: Record<string, unknown>;
}
/**
 * Return type of the useFeed headless hook.
 */
export interface UseFeedResult {
    /** Current page items (resolved). */
    items: FeedItem[];
    /** Whether the initial data load is in progress. */
    isLoading: boolean;
    /** Error from last fetch attempt, or null. */
    error: Error | null;
    /** Whether there are more pages to load. */
    hasMore: boolean;
    /** Load the next page. */
    loadMore: () => void;
    /** Refetch from the beginning. */
    refetch: () => void;
    /** Currently selected item (published when `id` is set). */
    selectedItem: Record<string, unknown> | null;
    /** Select an item (publishes to context). */
    selectItem: (item: Record<string, unknown>) => void;
}
