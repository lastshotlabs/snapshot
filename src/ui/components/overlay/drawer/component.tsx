import React, { useCallback, useEffect, useRef, useState } from "react";
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
        zIndex: 50,
        display: "flex",
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
                fontSize: "1.25rem",
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
      </div>
    </div>
  );
}
