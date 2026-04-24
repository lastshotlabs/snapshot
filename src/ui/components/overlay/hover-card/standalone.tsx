"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { FloatingPanel } from "../../primitives/floating-menu";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface HoverCardBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The trigger element that activates the hover card. */
  trigger: ReactNode;
  /** Content rendered inside the hover card panel. */
  children: ReactNode;
  /** Delay in ms before the card opens on hover. */
  openDelay?: number;
  /** Delay in ms before the card closes on leave. */
  closeDelay?: number;
  /** Which side to show the panel. */
  side?: "top" | "bottom" | "left" | "right";
  /** Panel alignment relative to trigger. */
  align?: "start" | "center" | "end";
  /** Fixed width for the card. */
  width?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone HoverCard — a floating panel that appears on hover with plain
 * React props. No manifest context required.
 *
 * @example
 * ```tsx
 * <HoverCardBase
 *   trigger={<span>Hover me</span>}
 *   width="300px"
 * >
 *   <p>Card content</p>
 * </HoverCardBase>
 * ```
 */
export function HoverCardBase({
  id,
  trigger,
  children,
  openDelay = 300,
  closeDelay = 200,
  side = "bottom",
  align = "center",
  width,
  className,
  style,
  slots,
}: HoverCardBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "hover-card";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.5rem)",
    },
    componentSurface: slots?.content,
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
      {trigger}
      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        side={side}
        align={align}
        surfaceId={`${rootId}-panel`}
        slot={slots?.panel}
        activeStates={isOpen ? ["open"] : []}
        style={width ? { width } : undefined}
      >
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {children}
        </div>
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
