/**
 * Custom emoji utilities — shortcode parsing and rendering support.
 *
 * Custom emojis are image-based emojis uploaded by users/admins.
 * They're referenced by shortcode (`:emoji_name:`) in text and
 * rendered as inline `<img>` elements.
 */

/** Shape of a custom emoji entry. */
export interface CustomEmoji {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Shortcode without colons (e.g., "party_parrot"). */
  shortcode: string;
  /** Image URL (resolved). */
  url: string;
  /** Storage key from bunshot (before URL resolution). */
  uploadKey?: string;
  /** Optional category for grouping. */
  category?: string;
  /** Whether this is an animated emoji (GIF). */
  animated?: boolean;
}

/**
 * Resolves emoji records from the API into CustomEmoji entries.
 * Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping.
 *
 * @param records - Raw API response records
 * @param urlField - Field name containing the image URL. Default: "url"
 * @param urlPrefix - Prefix to prepend to uploadKey for URL resolution
 */
export function resolveEmojiRecords(
  records: Record<string, unknown>[],
  urlField = "url",
  urlPrefix?: string,
): CustomEmoji[] {
  return records.map((r) => {
    let url = String(r[urlField] ?? "");
    // If no direct URL field, try resolving uploadKey with prefix
    if (!url && r.uploadKey && urlPrefix) {
      url = `${urlPrefix}${r.uploadKey}`;
    }
    return {
      id: String(r.id ?? ""),
      name: String(r.name ?? ""),
      shortcode: String(r.shortcode ?? ""),
      url,
      uploadKey: r.uploadKey ? String(r.uploadKey) : undefined,
      category: r.category ? String(r.category) : undefined,
      animated: Boolean(r.animated ?? false),
    };
  });
}

/**
 * Parses shortcodes in text and replaces them with `<img>` tags.
 *
 * @param text - The text containing shortcodes like `:emoji_name:`
 * @param emojis - Map of shortcode → CustomEmoji
 * @returns HTML string with shortcodes replaced by img tags
 *
 * @example
 * ```ts
 * const emojis = new Map([["wave", { url: "/emojis/wave.gif", ... }]]);
 * parseShortcodes("Hello :wave:", emojis);
 * // → 'Hello <img class="sn-custom-emoji" src="/emojis/wave.gif" alt=":wave:" title="wave" />'
 * ```
 */
export function parseShortcodes(
  text: string,
  emojis: Map<string, CustomEmoji>,
): string {
  if (!text || emojis.size === 0) return text;

  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcode: string) => {
    const emoji = emojis.get(shortcode);
    if (!emoji) return match; // Leave unknown shortcodes as-is

    return `<img class="sn-custom-emoji" src="${escapeAttr(emoji.url)}" alt=":${escapeAttr(shortcode)}:" title="${escapeAttr(emoji.name)}" draggable="false" />`;
  });
}

/**
 * Builds a shortcode lookup map from an array of custom emojis.
 */
export function buildEmojiMap(emojis: CustomEmoji[]): Map<string, CustomEmoji> {
  const map = new Map<string, CustomEmoji>();
  for (const emoji of emojis) {
    map.set(emoji.shortcode, emoji);
  }
  return map;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * CSS for custom emoji sizing.
 * Custom emojis render as inline images sized to match surrounding text.
 */
export const CUSTOM_EMOJI_CSS = `
.sn-custom-emoji {
  display: inline-block;
  width: 1.375em;
  height: 1.375em;
  vertical-align: -0.3em;
  object-fit: contain;
  margin: 0 0.05em;
}
`;
