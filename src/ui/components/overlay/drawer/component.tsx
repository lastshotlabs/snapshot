import React, { useCallback, useEffect, useRef } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/renderer";
import { useDrawer } from "./hook";
import type { DrawerConfig } from "./schema";

/**
 * Size to width mapping for drawer panels.
 */
const SIZE_MAP: Record<string, string> = {
  sm: "var(--sn-drawer-size-sm, 20rem)",
  md: "var(--sn-drawer-size-md, 28rem)",
  lg: "var(--sn-drawer-size-lg, 36rem)",
  xl: "var(--sn-drawer-size-xl, 48rem)",
  full: "100vw",
};

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

  const side = config.side ?? "right";
  const size = config.size ?? "md";
  const width = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Focus the panel when it opens
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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
          backgroundColor: "var(--sn-modal-overlay-bg, rgba(0, 0, 0, 0.5))",
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
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--sn-spacing-xs, 0.25rem)",
                color: "var(--sn-color-muted, #6b7280)",
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
