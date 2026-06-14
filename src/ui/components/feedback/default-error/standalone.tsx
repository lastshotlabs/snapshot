"use client";

import type { CSSProperties } from "react";
import type { SlotOverrides } from "../../_base/types";
import { FeedbackStateBase } from "../feedback-state";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface DefaultErrorBaseProps {
  /** Pre-resolved title text. */
  title?: string;
  /** Pre-resolved description text. */
  description?: string;
  /** Whether to show a retry button. */
  showRetry?: boolean;
  /** Pre-resolved retry button label. */
  retryLabel?: string;
  /** Retry callback — called when the retry button is clicked. */
  onRetry?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, title, description, action). */
  slots?: SlotOverrides;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultError — renders an error feedback card with optional
 * retry button. Works with plain React props.
 *
 * @example
 * ```tsx
 * <DefaultErrorBase
 *   title="Something went wrong"
 *   description="Please try again later."
 *   showRetry
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export function DefaultErrorBase({
  title,
  description,
  showRetry,
  retryLabel,
  onRetry,
  id,
  className,
  style,
  slots,
}: DefaultErrorBaseProps) {
  const rootId = id ?? "error-page";

  return (
    <FeedbackStateBase
      title={title ?? "Something went wrong"}
      description={description ?? "Please try again."}
      feedbackType="error"
      role="alert"
      ariaLive="assertive"
      surfaceId={rootId}
      rootSurfaceBase={{
        display: "grid",
        gap: "var(--sn-spacing-md, 1rem)",
        style: {
          padding: "var(--sn-spacing-xl, 2rem)",
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          border: "1px solid var(--sn-color-border, #e5e7eb)",
          background: "var(--sn-color-card, #ffffff)",
          color: "var(--sn-color-foreground, #111827)",
        },
      }}
      titleSurfaceBase={{
        fontSize: "xl",
        fontWeight: "semibold",
        style: {
          margin: 0,
        },
      }}
      descriptionSurfaceBase={{
        color: "var(--sn-color-muted-foreground, #6b7280)",
        style: {
          margin: "var(--sn-spacing-xs, 0.25rem) 0 0",
        },
      }}
      actionSurfaceBase={{
        style: {
          alignSelf: "start",
        },
      }}
      action={
        showRetry
          ? {
              label: retryLabel ?? "Try again",
              variant: "default",
              onClick: onRetry ?? (() => window.location.reload()),
            }
          : undefined
      }
      className={className}
      style={style}
      slots={slots}
    />
  );
}
