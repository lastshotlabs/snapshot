'use client';

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

/** A segment of text, either a match or a plain string. */
interface TextSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Split text into segments based on a search query.
 */
function splitByQuery(
  text: string,
  query: string,
  caseSensitive: boolean,
): TextSegment[] {
  if (!query) return [{ text, isMatch: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(escaped, flags);

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
      });
    }
    segments.push({ text: match[0], isMatch: true });
    lastIndex = regex.lastIndex;

    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return segments.length > 0 ? segments : [{ text, isMatch: false }];
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface HighlightedTextBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The text to display. */
  text: string;
  /** The search query to highlight. */
  highlight?: string;
  /** Whether the highlight matching is case-sensitive. */
  caseSensitive?: boolean;
  /** Highlight background color. */
  highlightColor?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, mark). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone HighlightedText — renders text with search query highlighting.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <HighlightedTextBase
 *   text="The quick brown fox jumps over the lazy dog"
 *   highlight="fox"
 *   highlightColor="var(--sn-color-warning)"
 * />
 * ```
 */
export function HighlightedTextBase({
  id,
  text,
  highlight = "",
  caseSensitive = false,
  highlightColor = "var(--sn-color-warning, #f59e0b)",
  className,
  style,
  slots,
}: HighlightedTextBaseProps) {
  const rootId = id ?? "highlighted-text";

  const segments = useMemo(
    () => splitByQuery(text, highlight, caseSensitive),
    [text, highlight, caseSensitive],
  );

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const markSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-mark`,
    implementationBase: {
      style: {
        backgroundColor: highlightColor,
        color: "var(--sn-color-warning-foreground, #000000)",
        borderRadius: "var(--sn-radius-xs, 0.125rem)",
        padding: "0 0.1em",
      },
    },
    componentSurface: slots?.mark,
  });

  return (
    <span
      data-snapshot-component="highlighted-text"
      data-snapshot-id={rootId}
      data-testid="highlighted-text"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {segments.map((segment, i) =>
        segment.isMatch ? (
          <mark
            key={i}
            data-snapshot-id={`${rootId}-mark`}
            data-testid="highlight-mark"
            className={markSurface.className}
            style={markSurface.style}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={markSurface.scopedCss} />
    </span>
  );
}
