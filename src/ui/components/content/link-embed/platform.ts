/**
 * Platform detection and embed URL extraction.
 *
 * Identifies known platforms from URLs and extracts the embed-compatible
 * URL or ID needed to render platform-specific iframes.
 */

export type Platform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "gif"
  | "generic";

export interface PlatformInfo {
  platform: Platform;
  embedId: string;
  embedUrl: string;
}

/** YouTube URL patterns. */
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

/** Instagram URL patterns. */
const INSTAGRAM_PATTERNS = [/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/];

/** TikTok URL patterns. */
const TIKTOK_PATTERNS = [
  /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  /tiktok\.com\/t\/([a-zA-Z0-9]+)/,
];

/** Twitter/X URL patterns. */
const TWITTER_PATTERNS = [/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/];

/** GIF URL patterns (direct image links). */
const GIF_PATTERNS = [
  /\.(gif|webp)(\?.*)?$/i,
  /giphy\.com\/media\/([a-zA-Z0-9]+)/,
  /tenor\.com\/view\/[^/]+-(\d+)/,
  /media\.giphy\.com\/media\/([a-zA-Z0-9]+)/,
];

/**
 * Detects the platform from a URL and extracts embed info.
 *
 * @param url - The URL to analyze
 * @returns Platform info with embed ID and URL, or null for generic
 */
export function detectPlatform(
  url: string,
  options?: { darkMode?: boolean },
): PlatformInfo | null {
  // YouTube
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "youtube",
        embedId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
      };
    }
  }

  // Instagram
  for (const pattern of INSTAGRAM_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "instagram",
        embedId: match[1],
        embedUrl: `https://www.instagram.com/p/${match[1]}/embed`,
      };
    }
  }

  // TikTok
  for (const pattern of TIKTOK_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "tiktok",
        embedId: match[1],
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
      };
    }
  }

  // Twitter/X
  for (const pattern of TWITTER_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        platform: "twitter",
        embedId: match[1],
        // Twitter doesn't have a simple iframe embed — use publish.twitter.com
        embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${match[1]}&theme=${options?.darkMode ? "dark" : "light"}`,
      };
    }
  }

  // GIF (direct image or known GIF services)
  for (const pattern of GIF_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: "gif",
        embedId: match[1] ?? "",
        embedUrl: url,
      };
    }
  }

  return null;
}

/** Platform accent colors. */
export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "#ff0000",
  instagram: "#e1306c",
  tiktok: "#000000",
  twitter: "#1da1f2",
  gif: "transparent",
  generic: "var(--sn-color-border, #e5e7eb)",
};

/** Platform display names. */
export const PLATFORM_NAMES: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter",
  gif: "GIF",
  generic: "",
};
