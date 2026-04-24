'use client';

import { useId, useMemo, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  mergeClassNames,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ScrollAreaBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Scroll orientation. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Maximum height of the scroll area. */
  maxHeight?: string;
  /** Maximum width of the scroll area. */
  maxWidth?: string;
  /** Scrollbar visibility behavior. */
  showScrollbar?: "auto" | "always" | "hover";
  /** Child content. */
  children?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, viewport). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ScrollArea — a scrollable container with custom-styled thin
 * scrollbars. No manifest context required.
 *
 * @example
 * ```tsx
 * <ScrollAreaBase maxHeight="300px" showScrollbar="hover">
 *   <ul>
 *     {items.map((item) => (
 *       <li key={item.id}>{item.name}</li>
 *     ))}
 *   </ul>
 * </ScrollAreaBase>
 * ```
 */
export function ScrollAreaBase({
  id,
  orientation = "vertical",
  maxHeight = "400px",
  maxWidth,
  showScrollbar = "auto",
  children,
  className,
  style,
  slots,
}: ScrollAreaBaseProps) {
  const scopeId = useId();
  const scopeClass = `sn-scroll-${scopeId.replace(/:/g, "")}`;
  const rootId = id ?? "scroll-area";

  const overflowX =
    orientation === "horizontal" || orientation === "both" ? "auto" : "hidden";
  const overflowY =
    orientation === "vertical" || orientation === "both" ? "auto" : "hidden";

  const scrollbarStyles = useMemo(() => {
    const alwaysShow = showScrollbar === "always";
    const hoverOnly = showScrollbar === "hover";

    let css = `
.${scopeClass}::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.${scopeClass}::-webkit-scrollbar-track {
  background: var(--sn-color-secondary, #f3f4f6);
  border-radius: var(--sn-radius-full, 9999px);
}
.${scopeClass}::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%);
  border-radius: var(--sn-radius-full, 9999px);
}
.${scopeClass}::-webkit-scrollbar-thumb:hover {
  background: var(--sn-color-muted-foreground, #6b7280);
}`;

    if (hoverOnly) {
      css += `
.${scopeClass}::-webkit-scrollbar-thumb {
  background: transparent;
}
.${scopeClass}:hover::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%);
}
.${scopeClass}:hover::-webkit-scrollbar-thumb:hover {
  background: var(--sn-color-muted-foreground, #6b7280);
}`;
    }

    if (alwaysShow || !hoverOnly) {
      css += `
.${scopeClass} {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%) var(--sn-color-secondary, #f3f4f6);
}`;
    } else {
      css += `
.${scopeClass} {
  scrollbar-width: thin;
  scrollbar-color: transparent var(--sn-color-secondary, #f3f4f6);
}
.${scopeClass}:hover {
  scrollbar-color: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%) var(--sn-color-secondary, #f3f4f6);
}`;
    }

    return css;
  }, [scopeClass, showScrollbar]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const viewportSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-viewport`,
    implementationBase: {
      style: {
        maxHeight,
        maxWidth,
        overflowX,
        overflowY,
      },
    },
    componentSurface: slots?.viewport,
  });

  return (
    <div
      data-snapshot-component="scroll-area"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-viewport`}
        className={mergeClassNames(scopeClass, viewportSurface.className)}
        style={viewportSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={scrollbarStyles} />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={viewportSurface.scopedCss} />
    </div>
  );
}
