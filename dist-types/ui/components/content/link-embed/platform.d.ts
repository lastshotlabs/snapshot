/**
 * Platform detection and embed URL extraction.
 *
 * Identifies known platforms from URLs and extracts the embed-compatible
 * URL or ID needed to render platform-specific iframes.
 */
export type Platform = "youtube" | "instagram" | "tiktok" | "twitter" | "gif" | "generic";
/** Resolved platform metadata used to render a platform-specific embedded preview. */
export interface PlatformInfo {
    platform: Platform;
    embedId: string;
    embedUrl: string;
}
/**
 * Detects the platform from a URL and extracts embed info.
 *
 * @param url - The URL to analyze
 * @returns Platform info with embed ID and URL, or null for generic
 */
export declare function detectPlatform(url: string, options?: {
    darkMode?: boolean;
}): PlatformInfo | null;
/** Platform accent colors. */
export declare const PLATFORM_COLORS: Record<Platform, string>;
/** Platform display names. */
export declare const PLATFORM_NAMES: Record<Platform, string>;
