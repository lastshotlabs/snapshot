'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CodeBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The code text to display. */
  value: string;
  /** Fallback text when value is empty. */
  fallback?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Code — an inline code element for displaying code snippets
 * within flowing text. No manifest context required.
 *
 * @example
 * ```tsx
 * <CodeBase value="npm install snapshot" />
 * ```
 */
export function CodeBase({
  id,
  value,
  fallback = "",
  className,
  style,
  slots,
}: CodeBaseProps) {
  const rootId = id ?? "code";
  const displayValue =
    value.trim().length > 0 ? value : fallback;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        fontFamily: "var(--sn-font-mono, monospace)",
        fontSize: "0.95em",
        backgroundColor: "var(--sn-color-muted, #f3f4f6)",
        color: "var(--sn-color-foreground, #111827)",
        padding: "0.15em 0.35em",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        wordBreak: "break-word",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <code
        data-snapshot-component="code"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {displayValue}
      </code>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
