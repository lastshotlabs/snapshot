"use client";

import { useEffect, useRef, useState } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { FloatingPanel } from "../../primitives/floating-menu";
import type { HoverCardConfig } from "./types";

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

export function HoverCard({ config }: { config: HoverCardConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openDelay = config.openDelay ?? 300;
  const closeDelay = config.closeDelay ?? 200;
  const rootId = config.id ?? "hover-card";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.5rem)",
    },
    componentSurface: config.slots?.content,
  });

  const clearTimers = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleEnter = () => {
    clearTimers();
    openTimerRef.current = setTimeout(() => {
      setIsOpen(true);
      openTimerRef.current = null;
    }, openDelay);
  };

  const handleLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, closeDelay);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div
      ref={containerRef}
      data-snapshot-component="hover-card"
      data-snapshot-id={`${rootId}-root`}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ComponentRenderer config={config.trigger} />
      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        side={config.side ?? "bottom"}
        align={config.align ?? "center"}
        surfaceId={`${rootId}-panel`}
        slot={config.slots?.panel}
        activeStates={isOpen ? ["open"] : []}
        style={config.width ? { width: config.width } : undefined}
      >
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {config.content.map((child, index) => (
            <ComponentRenderer
              key={(child as { id?: string }).id ?? index}
              config={child}
            />
          ))}
        </div>
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
