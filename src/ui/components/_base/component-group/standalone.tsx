'use client';

import type { CSSProperties, ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { SurfaceStyles } from "../surface-styles";
import { resolveSurfacePresentation } from "../style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ComponentGroupBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root). */
  slots?: SlotOverrides;
  /** React children — pre-rendered group content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ComponentGroup — a simple wrapper for pre-rendered group content.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <ComponentGroupBase id="my-group">
 *   <MyComponentA />
 *   <MyComponentB />
 * </ComponentGroupBase>
 * ```
 */
export function ComponentGroupBase({
  id,
  className,
  style,
  slots,
  children,
}: ComponentGroupBaseProps) {
  const rootId = id ?? "component-group";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {},
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <div
        data-snapshot-component="component-group"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
