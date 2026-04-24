'use client';

import type { CSSProperties, ReactNode } from "react";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Gap tokens ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface GridBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Grid template areas (responsive). */
  areas?: string[];
  /** Number of columns or a CSS grid-template-columns value (responsive). */
  columns?: number | string;
  /** Grid template rows (CSS value). */
  rows?: string;
  /** Gap between grid items -- a token name or raw CSS value. */
  gap?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered as grid items. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Grid -- a CSS grid container.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <GridBase columns={3} gap="md">
 *   <div>Cell 1</div>
 *   <div>Cell 2</div>
 *   <div>Cell 3</div>
 * </GridBase>
 * ```
 */
export function GridBase({
  id,
  areas,
  columns,
  rows,
  gap: gapProp,
  className,
  style,
  slots,
  children,
}: GridBaseProps) {
  const resolvedAreas = useResponsiveValue(areas);
  const resolvedColumns = useResponsiveValue(columns);
  const gap = useResponsiveValue(gapProp);
  const rootId = id ?? "grid";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      width: "100%",
      gap: gap ? GAP_MAP[gap] ?? gap : undefined,
      style: {
        gridTemplateAreas: resolvedAreas?.map((row) => `"${row}"`).join(" "),
        gridTemplateColumns:
          typeof resolvedColumns === "number"
            ? `repeat(${resolvedColumns}, minmax(0, 1fr))`
            : resolvedColumns,
        gridTemplateRows: rows,
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      data-snapshot-component="grid"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {children}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
