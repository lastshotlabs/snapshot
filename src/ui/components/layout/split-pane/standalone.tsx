'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  mergeClassNames,
  mergeStyles,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SplitPaneBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Split direction. Default: "horizontal". */
  direction?: "horizontal" | "vertical";
  /** Initial split percentage. Default: 50. */
  defaultSplit?: number;
  /** Minimum pane size in pixels. Default: 100. */
  minSize?: number;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, pane, firstPane, secondPane, divider). */
  slots?: Record<string, Record<string, unknown>>;
  /** Content for the first pane. */
  first?: ReactNode;
  /** Content for the second pane. */
  second?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone SplitPane -- a resizable two-pane layout with a draggable divider.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SplitPaneBase
 *   direction="horizontal"
 *   defaultSplit={40}
 *   first={<div>Left pane</div>}
 *   second={<div>Right pane</div>}
 * />
 * ```
 */
export function SplitPaneBase({
  id,
  direction = "horizontal",
  defaultSplit = 50,
  minSize = 100,
  className,
  style,
  slots,
  first,
  second,
}: SplitPaneBaseProps) {
  const [split, setSplit] = useState(defaultSplit);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rootId = id ?? "split-pane";
  const isHorizontal = direction === "horizontal";

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct: number;
      if (direction === "horizontal") {
        const x = e.clientX - rect.left;
        pct = (x / rect.width) * 100;
      } else {
        const y = e.clientY - rect.top;
        pct = (y / rect.height) * 100;
      }

      const minPct =
        (minSize / (direction === "horizontal" ? rect.width : rect.height)) *
        100;
      pct = Math.max(minPct, Math.min(100 - minPct, pct));
      setSplit(pct);
    },
    [direction, minSize],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      width: "100%",
      overflow: "hidden",
      height: isHorizontal ? "100%" : undefined,
      minHeight: isHorizontal ? "400px" : undefined,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const paneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pane`,
    implementationBase: {
      overflow: "auto",
    },
    componentSurface: slots?.pane,
  });
  const firstPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-first-pane`,
    implementationBase: {
      overflow: "auto",
      width: isHorizontal ? `${split}%` : undefined,
      height: !isHorizontal ? `${split}%` : undefined,
      minWidth: isHorizontal ? `${minSize}px` : undefined,
      minHeight: !isHorizontal ? `${minSize}px` : undefined,
    },
    componentSurface: slots?.firstPane,
  });
  const secondPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-second-pane`,
    implementationBase: {
      overflow: "auto",
      flex: "1",
      minWidth: isHorizontal ? `${minSize}px` : undefined,
      minHeight: !isHorizontal ? `${minSize}px` : undefined,
    },
    componentSurface: slots?.secondPane,
  });
  const dividerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-divider`,
    implementationBase: {
      hover: {
        bg: "var(--sn-color-primary, #2563eb)",
      },
      states: {
        active: {
          bg: "var(--sn-color-primary, #2563eb)",
        },
      },
      width: isHorizontal ? "4px" : "100%",
      height: !isHorizontal ? "4px" : "100%",
      minWidth: isHorizontal ? "4px" : undefined,
      minHeight: !isHorizontal ? "4px" : undefined,
      bg: "var(--sn-color-border, #e5e7eb)",
      cursor: isHorizontal ? "col-resize" : "row-resize",
      flex: "0 0 auto",
      transition: "background 0.15s",
    },
    componentSurface: slots?.divider,
    activeStates: dragging ? ["active"] : [],
  });

  return (
    <>
      <div
        ref={containerRef}
        data-snapshot-component="split-pane"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-first-pane`}
          className={mergeClassNames(
            paneSurface.className,
            firstPaneSurface.className,
          )}
          style={mergeStyles(paneSurface.style, firstPaneSurface.style)}
        >
          {first}
        </div>

        <div
          data-snapshot-id={`${rootId}-divider`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={dividerSurface.className}
          style={dividerSurface.style}
        />

        <div
          data-snapshot-id={`${rootId}-second-pane`}
          className={mergeClassNames(
            paneSurface.className,
            secondPaneSurface.className,
          )}
          style={mergeStyles(paneSurface.style, secondPaneSurface.style)}
        >
          {second}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={paneSurface.scopedCss} />
      <SurfaceStyles css={firstPaneSurface.scopedCss} />
      <SurfaceStyles css={secondPaneSurface.scopedCss} />
      <SurfaceStyles css={dividerSurface.scopedCss} />
    </>
  );
}
