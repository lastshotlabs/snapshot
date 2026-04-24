'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Token maps (shared with manifest variant) ────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  default: "var(--sn-color-foreground)",
  muted: "var(--sn-color-muted-foreground)",
  subtle:
    "color-mix(in oklch, var(--sn-color-muted-foreground) 75%, transparent)",
};

const SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-font-size-xs, 0.75rem)",
  sm: "var(--sn-font-size-sm, 0.875rem)",
  md: "var(--sn-font-size-md, 1rem)",
  lg: "var(--sn-font-size-lg, 1.125rem)",
};

const WEIGHT_MAP: Record<string, CSSProperties["fontWeight"]> = {
  light: "var(--sn-font-weight-light, 300)",
  normal: "var(--sn-font-weight-normal, 400)",
  medium: "var(--sn-font-weight-medium, 500)",
  semibold: "var(--sn-font-weight-semibold, 600)",
  bold: "var(--sn-font-weight-bold, 700)",
};

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface TextBaseProps {
  /** Text content to display. */
  value?: string;
  /** Color variant. */
  variant?: "default" | "muted" | "subtle";
  /** Font size token. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Font weight token. */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  /** Text alignment. */
  align?: "left" | "center" | "right";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone Text — renders a styled paragraph element with token-based
 * typography. No manifest context required.
 *
 * @example
 * ```tsx
 * <TextBase value="Hello, world!" variant="muted" size="sm" />
 * ```
 */
export function TextBase({
  value,
  variant = "default",
  size = "md",
  weight = "normal",
  align = "left",
  id,
  className,
  style,
  slots,
}: TextBaseProps) {
  const rootId = id ?? "text";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      color: COLOR_MAP[variant],
      fontSize: SIZE_MAP[size],
      fontWeight: WEIGHT_MAP[weight],
      textAlign: align,
      style: { margin: 0 },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <p
        data-snapshot-component="text"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {value}
      </p>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
