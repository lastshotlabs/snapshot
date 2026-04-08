import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import type { ActionConfig } from "../../../actions/types";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { useDrawer } from "./hook";
import type { DrawerConfig } from "./schema";

/**
 * Size to width mapping for drawer panels.
 */
const SIZE_MAP: Record<string, string> = {
  sm: "20rem",
  md: "28rem",
  lg: "36rem",
  xl: "48rem",
  full: "100vw",
};

const ANIMATION_DURATION = 200;

/** Maps footer align value to CSS justifyContent. */
const ALIGN_MAP: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

/** Maps button variant to background + text color tokens. */
function getButtonStyles(variant: string = "default"): React.CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "var(--sn-color-secondary, #f1f5f9)",
        color: "var(--sn-color-secondary-foreground, #0f172a)",
      };
    case "destructive":
      return {
        backgroundColor: "var(--sn-color-destructive, #ef4444)",
        color: "var(--sn-color-destructive-foreground, #fff)",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--sn-color-foreground, #111)",
      };
    default:
      return {
        backgroundColor: "var(--sn-color-primary, #2563eb)",
        color: "var(--sn-color-primary-foreground, #fff)",
      };
  }
}

/**
 * Drawer component — renders a slide-in panel from the left or right edge.
 *
 * Controlled by the modal manager (open-modal/close-modal actions).
 * Content is rendered via ComponentRenderer for recursive composition.
 * Supports FromRef trigger for auto-open behavior.
 *
 * @param props.config - The drawer config from the manifest
 */
export function DrawerComponent({ config }: { config: DrawerConfig }) {
  const { isOpen, close, title } = useDrawer(config);
  const execute = useActionExecutor();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const side = config.side ?? "right";
  const size = config.size ?? "md";
  const width = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Handle mount/unmount with animation.
  // Uses setTimeout(0) instead of double-rAF for reliable animation
  // trigger across React 18+ batching and strict mode.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const enterTimer = setTimeout(() => setAnimating(true), 10);
      return () => clearTimeout(enterTimer);
    } else if (mounted) {
      setAnimating(false);
      const exitTimer = setTimeout(() => setMounted(false), ANIMATION_DURATION);
      return () => clearTimeout(exitTimer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the panel when it opens
  useEffect(() => {
    if (isOpen && animating && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen, animating]);

  // Escape key closes the drawer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    },
    [close],
  );

  // Click on overlay closes the drawer
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  if (!mounted) return null;

  const translateValue =
    side === "left"
      ? animating
        ? "translateX(0)"
        : "translateX(-100%)"
      : animating
        ? "translateX(0)"
        : "translateX(100%)";

  return (
    <div
      data-snapshot-component="drawer"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--sn-z-index-modal, 40)" as unknown as number,
        display: "flex",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Overlay */}
      <div
        data-snapshot-drawer-overlay=""
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--sn-modal-overlay, rgba(0, 0, 0, 0.5))",
          opacity: animating ? 1 : 0,
          transition: `opacity ${ANIMATION_DURATION}ms ease`,
          zIndex: -1,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-snapshot-drawer-panel=""
        data-side={side}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [side === "left" ? "left" : "right"]: 0,
          width,
          maxWidth: "100vw",
          backgroundColor: "var(--sn-color-surface, #fff)",
          boxShadow:
            "var(--sn-shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          outline: "none",
          transform: translateValue,
          transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      >
        <style>{`
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:focus { outline: none; }
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:hover {
            background-color: var(--sn-color-secondary, #f3f4f6);
          }
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
        `}</style>

        {/* Header */}
        {title && (
          <div
            data-snapshot-drawer-header=""
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding:
                "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
              borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
                color: "var(--sn-color-foreground, #111)",
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              data-snapshot-drawer-close=""
              data-testid="drawer-close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--sn-spacing-xs, 0.25rem)",
                borderRadius: "var(--sn-radius-sm, 0.25rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                lineHeight: 1,
              }}
            >
              {"\u00D7"}
            </button>
          </div>
        )}

        {/* Content */}
        <div
          data-snapshot-drawer-content=""
          style={{
            padding: "var(--sn-spacing-lg, 1.5rem)",
            overflow: "auto",
            flex: 1,
          }}
        >
          {config.content.map((child, i) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `drawer-child-${i}`}
              config={child as ComponentConfig}
            />
          ))}
        </div>

        {/* Footer */}
        {config.footer?.actions && config.footer.actions.length > 0 && (
          <div
            data-snapshot-drawer-footer=""
            style={{
              display: "flex",
              gap: "var(--sn-spacing-sm, 0.5rem)",
              justifyContent:
                ALIGN_MAP[config.footer.align ?? "right"] ?? "flex-end",
              borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
              padding:
                "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
            }}
          >
            {config.footer.actions.map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (btn.action) {
                    execute(btn.action as ActionConfig);
                  }
                  if (btn.dismiss) {
                    close();
                  }
                }}
                style={{
                  ...getButtonStyles(btn.variant),
                  border: "none",
                  cursor: "pointer",
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
                  borderRadius: "var(--sn-radius-md, 0.375rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  fontWeight: "var(--sn-font-weight-medium, 500)",
                  lineHeight: "var(--sn-leading-normal, 1.5)",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
