"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useSubscribe } from "../../../context/hooks";
import type { ComponentConfig } from "../../../manifest/types";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { TooltipConfig } from "./types";

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

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

/**
 * Tooltip component — wraps child components and shows informational
 * text on hover with configurable placement and delay.
 *
 * Uses inverted colors (foreground bg, background text) for contrast.
 * Supports FromRef for dynamic tooltip text and CSS transitions for
 * smooth fade-in/out.
 *
 * @param props.config - The tooltip config from the manifest
 */
export function TooltipComponent({ config }: { config: TooltipConfig }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();
  const rootId = config.id ?? "tooltip";
  const placement = config.placement ?? "top";
  const delay = config.delay ?? 300;

  const resolvedText = useSubscribe(config.text) as string;

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

  // Dismiss on Escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        hide();
      }
    },
    [visible, hide],
  );

  // Cleanup timeout on unmount
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
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.content,
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
    componentSurface: config.slots?.arrow,
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
        {config.content.map((child, index) => (
          <ComponentRenderer
            key={(child as ComponentConfig).id ?? `tooltip-child-${index}`}
            config={child as ComponentConfig}
          />
        ))}

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
          {resolvedText}
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
