'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Size tokens ──────────────────────────────────────────────────────────────

const HEADING_SIZE: Record<number, string> = {
  1: "var(--sn-font-size-4xl, 2.25rem)",
  2: "var(--sn-font-size-3xl, 1.875rem)",
  3: "var(--sn-font-size-2xl, 1.5rem)",
  4: "var(--sn-font-size-xl, 1.25rem)",
  5: "var(--sn-font-size-lg, 1.125rem)",
  6: "var(--sn-font-size-md, 1rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface HeadingBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The heading text. */
  text: string;
  /** Heading level (1-6). Default: 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Text alignment. */
  align?: "left" | "center" | "right";

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
 * Standalone Heading — a styled heading element (h1-h6) that works with plain
 * React props. No manifest context required.
 *
 * @example
 * ```tsx
 * <HeadingBase text="Welcome" level={1} align="center" />
 * ```
 */
export function HeadingBase({
  id,
  text,
  level = 2,
  align = "left",
  className,
  style,
  slots,
}: HeadingBaseProps) {
  const Tag = `h${level}` as const;
  const rootId = id ?? "heading";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        fontSize: HEADING_SIZE[level],
        fontWeight:
          level <= 2
            ? "var(--sn-font-weight-bold, 700)"
            : "var(--sn-font-weight-semibold, 600)",
        lineHeight: "var(--sn-leading-tight, 1.25)",
        textAlign: align,
        letterSpacing:
          level <= 2
            ? "var(--sn-tracking-tight, -0.025em)"
            : "var(--sn-tracking-normal, 0)",
        color: "var(--sn-color-foreground, #111827)",
        margin: 0,
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <Tag
        data-snapshot-component="heading"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {text}
      </Tag>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
