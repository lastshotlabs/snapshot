'use client';

import type { CSSProperties, ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { GAP_MAP } from "../../_base/style-props";

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
  slots?: SlotOverrides;
  /** React children rendered as grid items. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Grid -- a CSS grid container.
 * Works with plain React props.
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
