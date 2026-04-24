"use client";

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

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
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultOffline — renders an offline status banner.
 * No manifest context required.
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
  const componentSurface = className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      style: {
        padding: "var(--sn-spacing-md, 1rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border: "1px solid var(--sn-color-border, #cbd5e1)",
        background: "var(--sn-color-card, #ffffff)",
        color: "var(--sn-color-foreground, #0f172a)",
      },
    },
    componentSurface,
    itemSurface: slots?.root,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "base",
      fontWeight: "semibold",
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      fontSize: "sm",
    },
    componentSurface: slots?.description,
  });

  return (
    <div
      role="status"
      aria-live="polite"
      data-snapshot-feedback="offline"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <strong
        data-snapshot-id={`${rootId}-title`}
        className={titleSurface.className}
        style={titleSurface.style}
      >
        {title ?? "You're offline"}
      </strong>
      <span
        data-snapshot-id={`${rootId}-description`}
        className={descriptionSurface.className}
        style={descriptionSurface.style}
      >
        {description ?? "Reconnect to continue working."}
      </span>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
