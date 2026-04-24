'use client';

import type { CSSProperties, ReactNode } from "react";
import { ModalBase } from "../modal/standalone";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ConfirmDialogBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Dialog title. */
  title?: string;
  /** Description / body text. */
  description?: string;
  /** Confirm button label. */
  confirmLabel?: string;
  /** Cancel button label. */
  cancelLabel?: string;
  /** Confirm button variant. */
  confirmVariant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
  /** Cancel button variant. */
  cancelVariant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Called when confirm is clicked. */
  onConfirm?: () => void;
  /** Called when cancel is clicked. */
  onCancel?: () => void;
  /** Modal size. */
  size?: "sm" | "md" | "lg" | "xl" | "full";

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
 * Standalone ConfirmDialog — a confirmation dialog built on ModalBase with
 * plain React props. No manifest context required.
 *
 * @example
 * ```tsx
 * <ConfirmDialogBase
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   title="Delete Item?"
 *   description="This action cannot be undone."
 *   onConfirm={() => deleteItem()}
 * />
 * ```
 */
export function ConfirmDialogBase({
  id,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  cancelVariant = "secondary",
  open,
  onClose,
  onConfirm,
  onCancel,
  size = "sm",
  className,
  style,
  slots,
}: ConfirmDialogBaseProps) {
  const footer = [
    {
      label: cancelLabel,
      variant: cancelVariant,
      onClick: () => {
        onCancel?.();
        onClose();
      },
    },
    {
      label: confirmLabel,
      variant: confirmVariant,
      onClick: () => {
        onConfirm?.();
        onClose();
      },
    },
  ];

  return (
    <ModalBase
      id={id}
      title={title}
      open={open}
      onClose={onClose}
      size={size}
      footer={footer}
      className={className}
      style={style}
      slots={slots}
    >
      {description ? (
        <p
          style={{
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            margin: 0,
          }}
        >
          {description}
        </p>
      ) : null}
    </ModalBase>
  );
}
