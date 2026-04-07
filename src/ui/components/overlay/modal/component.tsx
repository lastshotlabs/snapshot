import React, { useCallback, useEffect, useRef } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/renderer";
import { useModal } from "./hook";
import type { ModalConfig } from "./schema";

/**
 * Size to max-width mapping for modal dialogs.
 */
const SIZE_MAP: Record<string, string> = {
  sm: "var(--sn-modal-size-sm, 24rem)",
  md: "var(--sn-modal-size-md, 32rem)",
  lg: "var(--sn-modal-size-lg, 42rem)",
  xl: "var(--sn-modal-size-xl, 56rem)",
  full: "100vw",
};

/**
 * Modal component — renders an overlay dialog with child components.
 *
 * Controlled by the modal manager (open-modal/close-modal actions).
 * Content is rendered via ComponentRenderer for recursive composition.
 * Supports FromRef trigger for auto-open behavior.
 *
 * @param props.config - The modal config from the manifest
 */
export function ModalComponent({ config }: { config: ModalConfig }) {
  const { isOpen, close, title } = useModal(config);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus the dialog when it opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // Escape key closes the modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    },
    [close],
  );

  // Click on overlay closes the modal
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  if (!isOpen) return null;

  const size = config.size ?? "md";
  const maxWidth = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      data-snapshot-component="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: size === "full" ? "stretch" : "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay */}
      <div
        data-snapshot-modal-overlay=""
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--sn-modal-overlay-bg, rgba(0, 0, 0, 0.5))",
          zIndex: -1,
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-snapshot-modal-dialog=""
        style={{
          position: "relative",
          maxWidth,
          width: "100%",
          maxHeight: size === "full" ? "100vh" : "85vh",
          backgroundColor: "var(--sn-color-surface, #fff)",
          borderRadius: size === "full" ? "0" : "var(--sn-radius-lg, 0.5rem)",
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
            data-snapshot-modal-header=""
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
              data-snapshot-modal-close=""
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
          data-snapshot-modal-content=""
          style={{
            padding: "var(--sn-spacing-lg, 1.5rem)",
            overflow: "auto",
            flex: 1,
          }}
        >
          {config.content.map((child, i) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `modal-child-${i}`}
              config={child as ComponentConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
