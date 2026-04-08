import React, { useState, useRef, useCallback, useEffect } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useSubscribe } from "../../../context/hooks";
import type { ComponentConfig } from "../../../manifest/types";
import type { TooltipConfig } from "./types";

/**
 * Placement-specific positioning and arrow styles.
 */
const PLACEMENT_STYLES: Record<
  string,
  {
    tooltip: React.CSSProperties;
    arrow: React.CSSProperties;
  }
> = {
  top: {
    tooltip: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      bottom: "-4px",
      left: "50%",
      transform: "translateX(-50%)",
      width: 0,
      height: 0,
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderTop: "5px solid var(--sn-color-foreground, #111827)",
    },
  },
  bottom: {
    tooltip: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      top: "-4px",
      left: "50%",
      transform: "translateX(-50%)",
      width: 0,
      height: 0,
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderBottom: "5px solid var(--sn-color-foreground, #111827)",
    },
  },
  left: {
    tooltip: {
      right: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginRight: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      right: "-4px",
      top: "50%",
      transform: "translateY(-50%)",
      width: 0,
      height: 0,
      borderTop: "5px solid transparent",
      borderBottom: "5px solid transparent",
      borderLeft: "5px solid var(--sn-color-foreground, #111827)",
    },
  },
  right: {
    tooltip: {
      left: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      marginLeft: "var(--sn-spacing-xs, 0.25rem)",
    },
    arrow: {
      position: "absolute",
      left: "-4px",
      top: "50%",
      transform: "translateY(-50%)",
      width: 0,
      height: 0,
      borderTop: "5px solid transparent",
      borderBottom: "5px solid transparent",
      borderRight: "5px solid var(--sn-color-foreground, #111827)",
    },
  },
};

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
  const placement = config.placement ?? "top";
  const delay = config.delay ?? 300;

  const resolvedText = useSubscribe(config.text) as string;

  const placementStyles = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES.top!;

  const show = useCallback(() => {
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

  return (
    <div
      data-snapshot-component="tooltip"
      data-testid="tooltip"
      className={config.className}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        display: "inline-block",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Trigger content */}
      {config.content.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `tooltip-child-${index}`}
          config={child as ComponentConfig}
        />
      ))}

      {/* Tooltip popup */}
      <div
        id={tooltipId}
        role="tooltip"
        data-testid="tooltip-popup"
        style={{
          position: "absolute",
          zIndex: 50,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
          backgroundColor: "var(--sn-color-foreground, #111827)",
          color: "var(--sn-color-background, #ffffff)",
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
          boxShadow: "var(--sn-shadow-md, 0 4px 6px rgba(0,0,0,0.1))",
          opacity: visible ? 1 : 0,
          transition: `opacity var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
          ...placementStyles.tooltip,
        }}
      >
        {resolvedText}
        {/* Arrow */}
        <div style={placementStyles.arrow} />
      </div>
    </div>
  );
}
