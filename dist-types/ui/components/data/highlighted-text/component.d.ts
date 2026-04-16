import type { HighlightedTextConfig } from "./types";
/**
 * HighlightedText component — renders text with search query highlighting.
 *
 * Splits the text by the highlight query and wraps matching portions
 * in `<mark>` elements. Lightweight and purely presentational.
 *
 * @param props - Component props containing the highlighted text configuration
 *
 * @example
 * ```json
 * {
 *   "type": "highlighted-text",
 *   "text": "Search results for: TypeScript generics",
 *   "highlight": "TypeScript",
 *   "caseSensitive": false
 * }
 * ```
 */
export declare function HighlightedText({ config }: {
    config: HighlightedTextConfig;
}): import("react/jsx-runtime").JSX.Element | null;
