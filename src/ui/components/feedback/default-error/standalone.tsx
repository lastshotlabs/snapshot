"use client";

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

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
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultError — renders an error feedback card with optional
 * retry button. No manifest context required.
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
  const componentSurface = className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-md, 1rem)",
      style: {
        padding: "var(--sn-spacing-xl, 2rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border: "1px solid var(--sn-color-border, #e2e8f0)",
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
      fontSize: "xl",
      fontWeight: "semibold",
      style: {
        margin: 0,
      },
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: {
        margin: "var(--sn-spacing-xs, 0.25rem) 0 0",
      },
    },
    componentSurface: slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    implementationBase: {
      style: {
        alignSelf: "start",
      },
    },
    componentSurface: slots?.action,
  });

  return (
    <div
      role="alert"
      data-snapshot-feedback="error"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div>
        <h2
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title ?? "Something went wrong"}
        </h2>
        <p
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description ?? "Please try again."}
        </p>
      </div>
      {showRetry ? (
        <ButtonControl
          type="button"
          variant="default"
          size="md"
          onClick={onRetry ?? (() => window.location.reload())}
          surfaceId={`${rootId}-action`}
          surfaceConfig={actionSurface.resolvedConfigForWrapper}
        >
          {retryLabel ?? "Try again"}
        </ButtonControl>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
