import { useCallback, useEffect } from "react";
import { token } from "../../tokens/utils";
import type { ModalConfig } from "./modal.schema";

const sizeMap: Record<string, string> = {
  sm: "400px",
  md: "500px",
  lg: "640px",
  xl: "800px",
  full: "calc(100vw - 2rem)",
};

interface ModalProps {
  config: ModalConfig;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

/**
 * Config-driven modal/dialog.
 * Identified by `id` — the action system opens/closes modals by ID.
 */
export function Modal({ config, isOpen, onClose, children }: ModalProps) {
  const closeOnOverlay = config.closeOnOverlay !== false;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const maxWidth = sizeMap[config.size ?? "md"] ?? sizeMap.md;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: token("zIndex.modal"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: token("spacing.4"),
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Content */}
      <div
        className={config.className}
        role="dialog"
        aria-modal="true"
        aria-label={config.title}
        style={{
          position: "relative",
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
          backgroundColor: token("colors.background"),
          borderRadius: token("radius.lg"),
          boxShadow: token("shadows.xl"),
          border: `1px solid ${token("colors.border")}`,
          padding: token("spacing.6"),
        }}
      >
        {config.title && (
          <div
            style={{
              fontSize: token("typography.fontSize.lg"),
              fontWeight: token("typography.fontWeight.semibold"),
              color: token("colors.foreground"),
              marginBottom: config.description ? token("spacing.1") : token("spacing.4"),
            }}
          >
            {config.title}
          </div>
        )}

        {config.description && (
          <div
            style={{
              fontSize: token("typography.fontSize.sm"),
              color: token("colors.muted-foreground"),
              marginBottom: token("spacing.4"),
            }}
          >
            {config.description}
          </div>
        )}

        {children}

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: token("spacing.4"),
            right: token("spacing.4"),
            background: "none",
            border: "none",
            fontSize: token("typography.fontSize.lg"),
            cursor: "pointer",
            color: token("colors.muted-foreground"),
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
