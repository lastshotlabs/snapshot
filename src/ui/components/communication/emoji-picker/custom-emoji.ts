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
  /** Image URL. */
  url: string;
  /** Optional category for grouping. */
  category?: string;
  /** Whether this is an animated emoji (GIF). */
  animated?: boolean;
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
