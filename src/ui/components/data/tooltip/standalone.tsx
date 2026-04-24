'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

/**
 * Placement-specific positioning and arrow styles.
 */
const PLACEMENT_STYLES: Record<
  string,
  {
    content: CSSProperties;
    arrow: CSSProperties;
  }
> = {
  top: {
    content: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      bottom: "-0.25rem",
      left: "50%",
      transform: "translateX(-50%) rotate(45deg)",
      width: "0.5rem",
      height: "0.5rem",
    },
  },
  bottom: {
    content: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      top: "-0.25rem",
      left: "50%",
      transform: "translateX(-50%) rotate(45deg)",
      width: "0.5rem",
      height: "0.5rem",
    },
  },
  left: {
    content: {
      right: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginRight: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      right: "-0.25rem",
      top: "50%",
      transform: "translateY(-50%) rotate(45deg)",
      width: "0.5rem",
      height: "0.5rem",
    },
  },
  right: {
    content: {
      left: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginLeft: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      left: "-0.25rem",
      top: "50%",
      transform: "translateY(-50%) rotate(45deg)",
      width: "0.5rem",
      height: "0.5rem",
    },
  },
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface TooltipBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Tooltip text. */
  text: string;
  /** Tooltip placement relative to the trigger element. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Delay before showing tooltip (ms). */
  delay?: number;
  /** Child content that triggers the tooltip on hover. */
  children?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, content, arrow). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Tooltip — wraps child content and shows informational text
 * on hover with configurable placement and delay. No manifest context required.
 *
 * @example
 * ```tsx
 * <TooltipBase text="Copy to clipboard" placement="top" delay={200}>
 *   <button onClick={handleCopy}>Copy</button>
 * </TooltipBase>
 * ```
 */
export function TooltipBase({
  id,
  text,
  placement = "top",
  delay = 300,
  children,
  className,
  style,
  slots,
}: TooltipBaseProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();
  const rootId = id ?? "tooltip";

  const placementStyles = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES.top!;

  const show = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        hide();
      }
    },
    [visible, hide],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      position: "absolute",
      color: "var(--sn-color-background, #ffffff)",
      bg: "var(--sn-color-foreground, #111827)",
      borderRadius: "sm",
      shadow: "md",
      opacity: 0,
      states: {
        open: {
          opacity: 1,
        },
      },
      style: {
        zIndex: "var(--sn-z-index-popover, 50)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        transition:
          "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
        visibility: visible ? "visible" : "hidden",
      },
    },
    componentSurface: slots?.content,
    activeStates: visible ? ["open"] : [],
  });
  const arrowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-arrow`,
    implementationBase: {
      bg: "var(--sn-color-foreground, #111827)",
      opacity: 0,
      states: {
        open: {
          opacity: 1,
        },
      },
      style: {
        position: "absolute",
      },
    },
    componentSurface: slots?.arrow,
    activeStates: visible ? ["open"] : [],
  });

  return (
    <>
      <div
        data-snapshot-component="tooltip"
        data-testid="tooltip"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        aria-describedby={visible ? tooltipId : undefined}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={handleKeyDown}
        style={rootSurface.style}
      >
        {children}

        <div
          id={tooltipId}
          role="tooltip"
          aria-hidden={!visible}
          data-tooltip-content=""
          data-testid="tooltip-popup"
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={{
            ...(contentSurface.style ?? {}),
            ...placementStyles.content,
          }}
        >
          {text}
          <div
            data-snapshot-id={`${rootId}-arrow`}
            className={arrowSurface.className}
            style={{
              ...(arrowSurface.style ?? {}),
              ...placementStyles.arrow,
            }}
          />
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={arrowSurface.scopedCss} />
    </>
  );
}
