'use client';

import type { CSSProperties, ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface OutletBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Pre-rendered children to display in the outlet (router-driven or manual). */
  children?: ReactNode;
  /** Fallback content rendered when `children` is empty/null. */
  fallback?: ReactNode;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: SlotOverrides;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone OutletBase — a router-agnostic mount point for child routes or
 * manually-supplied content. Works with plain React props.
 *
 * Pass router-rendered content as `children`. When children is empty,
 * `fallback` is rendered instead.
 *
 * @example
 * ```tsx
 * <OutletBase fallback={<EmptyState title="Pick a section" />}>
 *   {currentRouteContent}
 * </OutletBase>
 * ```
 */
export function OutletBase({
  id,
  children,
  fallback,
  className,
  style,
  slots,
}: OutletBaseProps) {
  const rootId = id ?? "outlet";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "contents",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  const content = children ?? fallback ?? null;

  return (
    <>
      <div
        data-snapshot-component="outlet"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {content}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
