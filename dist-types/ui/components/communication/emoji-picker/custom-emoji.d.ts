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
export declare function resolveEmojiRecords(records: Record<string, unknown>[], urlField?: string, urlPrefix?: string): CustomEmoji[];
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
export declare function parseShortcodes(text: string, emojis: Map<string, CustomEmoji>): string;
/**
 * Builds a shortcode lookup map from an array of custom emojis.
 */
export declare function buildEmojiMap(emojis: CustomEmoji[]): Map<string, CustomEmoji>;
/**
 * CSS for custom emoji sizing.
 * Custom emojis render as inline images sized to match surrounding text.
 */
export declare const CUSTOM_EMOJI_CSS = "\n.sn-custom-emoji {\n  display: inline-block;\n  width: 1.375em;\n  height: 1.375em;\n  vertical-align: -0.3em;\n  object-fit: contain;\n  margin: 0 0.05em;\n}\n";
