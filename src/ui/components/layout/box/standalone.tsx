'use client';

import { createElement, type CSSProperties, type ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface BoxBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** HTML element to render (default: "div"). */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav" | "span";
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered inside the box. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Box -- a generic container element with configurable HTML tag.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <BoxBase as="section">
 *   <p>Content here</p>
 * </BoxBase>
 * ```
 */
export function BoxBase({
  id,
  as = "div",
  className,
  style,
  slots,
  children,
}: BoxBaseProps) {
  const rootId = id ?? "box";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      {createElement(
        as,
        {
          "data-snapshot-component": "box",
          "data-snapshot-id": rootId,
          className: rootSurface.className,
          style: rootSurface.style,
        },
        children,
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
