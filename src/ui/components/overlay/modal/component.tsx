import React, { useCallback, useEffect, useRef, useState } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
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

const ANIMATION_DURATION = 200;

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
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const size = config.size ?? "md";
  const maxWidth = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Handle mount/unmount with animation.
  // Uses setTimeout instead of double-rAF for reliable animation
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

  // Focus trap: focus the dialog when it opens
  useEffect(() => {
    if (isOpen && animating && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen, animating]);

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

  if (!mounted) return null;

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
        data-testid="modal-overlay"
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
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1)" : "scale(0.95)",
          transition: `opacity ${ANIMATION_DURATION}ms ease, transform ${ANIMATION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
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
              data-testid="modal-close"
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
