'use client';

import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SaveIndicatorBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Current save status. */
  status: "idle" | "saving" | "saved" | "error";
  /** Whether to show the status icon. */
  showIcon?: boolean;
  /** Text shown while saving. */
  savingText?: string;
  /** Text shown when saved. */
  savedText?: string;
  /** Text shown on error. */
  errorText?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, icon, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone SaveIndicator — shows saving/saved/error status.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SaveIndicatorBase
 *   status="saving"
 *   showIcon
 *   savingText="Saving changes..."
 *   savedText="All changes saved"
 * />
 * ```
 */
export function SaveIndicatorBase({
  id,
  status,
  showIcon = true,
  savingText = "Saving...",
  savedText = "Saved",
  errorText = "Error saving",
  className,
  style,
  slots,
}: SaveIndicatorBaseProps) {
  if (status === "idle") {
    return null;
  }

  const rootId = id ?? "save-indicator";

  let icon: string | null = null;
  let text = "";
  let color = "";
  let spinning = false;
  const spinCss = `
    @keyframes sn-save-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  switch (status) {
    case "saving":
      icon = "loader";
      text = savingText;
      color = "var(--sn-color-muted-foreground, #6b7280)";
      spinning = true;
      break;
    case "saved":
      icon = "check";
      text = savedText;
      color = "var(--sn-color-success, #22c55e)";
      break;
    case "error":
      icon = "alert-circle";
      text = errorText;
      color = "var(--sn-color-destructive, #ef4444)";
      break;
    default:
      return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      fontSize: "sm",
      color,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: status === "saving" ? ["active"] : status === "error" ? ["invalid"] : [],
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: slots?.icon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {},
    componentSurface: slots?.label,
  });

  return (
    <span
      data-snapshot-component="save-indicator"
      data-testid="save-indicator"
      data-status={status}
      role="status"
      aria-live="polite"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {spinning ? <SurfaceStyles css={spinCss} /> : null}
      {showIcon && icon ? (
        <span
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={{
            ...(iconSurface.style ?? {}),
            ...(spinning
              ? {
                  animation: "sn-save-spin var(--sn-duration-slow, 1s) linear infinite",
                }
              : {}),
          }}
        >
          <Icon name={icon} size={14} />
        </span>
      ) : null}
      <span
        data-testid="save-indicator-text"
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {text}
      </span>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </span>
  );
}
