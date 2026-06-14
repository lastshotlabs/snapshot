"use client";

import type { CSSProperties } from "react";
import type { SlotOverrides } from "../../_base/types";
import { FeedbackStateBase } from "../feedback-state";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface DefaultOfflineBaseProps {
  /** Pre-resolved title text. */
  title?: string;
  /** Pre-resolved description text. */
  description?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, title, description). */
  slots?: SlotOverrides;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultOffline — renders an offline status banner.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <DefaultOfflineBase
 *   title="You're offline"
 *   description="Reconnect to continue working."
 * />
 * ```
 */
export function DefaultOfflineBase({
  title,
  description,
  id,
  className,
  style,
  slots,
}: DefaultOfflineBaseProps) {
  const rootId = id ?? "offline-banner";

  return (
    <FeedbackStateBase
      title={title ?? "You're offline"}
      description={description ?? "Reconnect to continue working."}
      feedbackType="offline"
      role="status"
      ariaLive="polite"
      surfaceId={rootId}
      rootSurfaceBase={{
        display: "grid",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        style: {
          padding: "var(--sn-spacing-md, 1rem)",
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          border: "1px solid var(--sn-color-border, #e5e7eb)",
          background: "var(--sn-color-card, #ffffff)",
          color: "var(--sn-color-foreground, #111827)",
        },
      }}
      titleSurfaceBase={{
        fontSize: "base",
        fontWeight: "semibold",
      }}
      descriptionSurfaceBase={{
        color: "var(--sn-color-muted-foreground, #6b7280)",
        fontSize: "sm",
      }}
      titleTag="strong"
      descriptionTag="span"
      className={className}
      style={style}
      slots={slots}
    />
  );
}
