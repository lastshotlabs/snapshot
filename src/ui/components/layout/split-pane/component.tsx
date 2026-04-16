'use client';

import { useCallback, useRef, useState } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SplitPaneConfig } from "./types";

export function SplitPane({ config }: { config: SplitPaneConfig }) {
  const direction = config.direction ?? "horizontal";
  const [split, setSplit] = useState(config.defaultSplit ?? 50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const minSize = config.minSize ?? 100;
  const rootId = config.id ?? "split-pane";
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
      style: {
        height: isHorizontal ? "100%" : undefined,
        minHeight: isHorizontal ? "400px" : undefined,
      },
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const paneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pane`,
    implementationBase: {
      overflow: "auto",
    },
    componentSurface: config.slots?.pane,
  });
  const firstPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-first-pane`,
    implementationBase: {
      overflow: "auto",
      style: {
        [isHorizontal ? "width" : "height"]: `${split}%`,
        minWidth: isHorizontal ? minSize : undefined,
        minHeight: !isHorizontal ? minSize : undefined,
      },
    },
    componentSurface: config.slots?.firstPane,
  });
  const secondPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-second-pane`,
    implementationBase: {
      overflow: "auto",
      flex: "1",
      style: {
        minWidth: isHorizontal ? minSize : undefined,
        minHeight: !isHorizontal ? minSize : undefined,
      },
    },
    componentSurface: config.slots?.secondPane,
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
      style: {
        [isHorizontal ? "width" : "height"]: "4px",
        [isHorizontal ? "minWidth" : "minHeight"]: "4px",
        background: "var(--sn-color-border, #e5e7eb)",
        cursor: isHorizontal ? "col-resize" : "row-resize",
        flexShrink: 0,
        transition: "background 0.15s",
      },
    },
    componentSurface: config.slots?.divider,
    activeStates: dragging ? ["active"] : [],
  });

  const children = Array.isArray(config.children) ? config.children.slice(0, 2) : [];

  return (
    <ComponentWrapper type="split-pane" id={config.id} config={config}>
      <div
        ref={containerRef}
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-first-pane`}
          className={[paneSurface.className, firstPaneSurface.className]
            .filter(Boolean)
            .join(" ") || undefined}
          style={{
            ...(paneSurface.style ?? {}),
            ...(firstPaneSurface.style ?? {}),
          }}
        >
          {children[0] != null ? <ComponentRenderer config={children[0]} /> : null}
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
          className={[paneSurface.className, secondPaneSurface.className]
            .filter(Boolean)
            .join(" ") || undefined}
          style={{
            ...(paneSurface.style ?? {}),
            ...(secondPaneSurface.style ?? {}),
          }}
        >
          {children[1] != null ? <ComponentRenderer config={children[1]} /> : null}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={paneSurface.scopedCss} />
      <SurfaceStyles css={firstPaneSurface.scopedCss} />
      <SurfaceStyles css={secondPaneSurface.scopedCss} />
      <SurfaceStyles css={dividerSurface.scopedCss} />
    </ComponentWrapper>
  );
}
