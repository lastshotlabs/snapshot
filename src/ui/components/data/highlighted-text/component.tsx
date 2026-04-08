import { useMemo, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import type { HighlightedTextConfig } from "./types";

/** A segment of text, either a match or a plain string. */
interface TextSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Split text into segments based on a search query.
 * Matching segments are marked with `isMatch: true`.
 */
function splitByQuery(
  text: string,
  query: string,
  caseSensitive: boolean,
): TextSegment[] {
  if (!query) return [{ text, isMatch: false }];

  // Escape regex special characters in the query
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(escaped, flags);

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding non-matching text
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isMatch: false });
    }
    // Add matching text
    segments.push({ text: match[0], isMatch: true });
    lastIndex = regex.lastIndex;

    // Guard against zero-length matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  // Add remaining non-matching text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return segments.length > 0 ? segments : [{ text, isMatch: false }];
}

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
export function HighlightedText({ config }: { config: HighlightedTextConfig }) {
  const resolvedText = useSubscribe(config.text) as string;
  const resolvedHighlight = useSubscribe(config.highlight ?? "");
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish && resolvedText) {
      publish({ text: resolvedText });
    }
  }, [publish, resolvedText]);

  const text = typeof resolvedText === "string" ? resolvedText : "";
  const highlight = typeof resolvedHighlight === "string" ? resolvedHighlight : "";
  const caseSensitive = config.caseSensitive ?? false;
  const highlightColor =
    config.highlightColor ?? "var(--sn-color-warning, #f59e0b)";

  const segments = useMemo(
    () => splitByQuery(text, highlight, caseSensitive),
    [text, highlight, caseSensitive],
  );

  if (visible === false) return null;

  return (
    <span
      data-snapshot-component="highlighted-text"
      data-testid="highlighted-text"
      className={config.className}
      style={{
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {segments.map((segment, i) =>
        segment.isMatch ? (
          <mark
            key={i}
            data-testid="highlight-mark"
            style={{
              backgroundColor: highlightColor,
              color: "var(--sn-color-warning-foreground, #000000)",
              borderRadius: "var(--sn-radius-xs, 0.125rem)",
              padding: "0 0.1em",
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
