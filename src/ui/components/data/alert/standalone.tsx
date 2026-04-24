'use client';

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

const DEFAULT_ICONS: Record<string, string> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  destructive: "alert-circle",
};

function variantColor(variant: string): string {
  switch (variant) {
    case "info":
      return "info";
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "destructive":
      return "destructive";
    default:
      return "border";
  }
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AlertBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Alert title. */
  title?: string;
  /** Alert description text. */
  description?: string;
  /** Variant — controls color accent and default icon. */
  variant?: "default" | "info" | "success" | "warning" | "destructive";
  /** Override the default icon for the variant. */
  icon?: string | null;
  /** Whether the alert can be dismissed. */
  dismissible?: boolean;
  /** Label for the action button. */
  actionLabel?: string;
  /** Callback when the action button is clicked. */
  onAction?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
  /** React children — rendered after description. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Alert — a styled alert/notification box with optional icon,
 * action button, and dismiss. No manifest context required.
 *
 * @example
 * ```tsx
 * <AlertBase
 *   variant="warning"
 *   title="Rate limit reached"
 *   description="You have exceeded the API rate limit. Please wait before retrying."
 *   dismissible
 *   actionLabel="View usage"
 *   onAction={() => navigate("/usage")}
 * />
 * ```
 */
export function AlertBase({
  id,
  title = "",
  description = "",
  variant = "default",
  icon: iconProp,
  dismissible = false,
  actionLabel,
  onAction,
  className,
  style,
  slots,
  children,
}: AlertBaseProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const colorToken = variantColor(variant);
  const icon = iconProp === undefined ? (DEFAULT_ICONS[variant] ?? null) : iconProp;
  const rootId = id ?? "alert";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      alignItems: "start",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      style: {
        padding: "var(--sn-spacing-md, 0.75rem) var(--sn-spacing-lg, 1.5rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderLeft: `4px solid var(--sn-color-${colorToken}, #e5e7eb)`,
        backgroundColor: "var(--sn-color-card, #ffffff)",
        position: "relative",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: `var(--sn-color-${colorToken === "border" ? "muted-foreground" : colorToken})`,
      style: {
        flexShrink: 0,
        marginTop: "var(--sn-spacing-2xs, 2px)",
        display: "flex",
      },
    },
    componentSurface: slots?.icon,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      flex: "1",
      minWidth: "0",
    },
    componentSurface: slots?.content,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "sm",
      fontWeight: "semibold",
      style: {
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      lineHeight: "normal",
    },
    componentSurface: slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    implementationBase: {
      style: {
        marginTop: "var(--sn-spacing-sm, 0.5rem)",
        color: `var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
        borderColor: `var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
      },
    },
    componentSurface: slots?.action,
  });
  const dismissSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dismiss`,
    implementationBase: {
      style: {
        alignSelf: "flex-start",
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: slots?.dismiss,
  });

  return (
    <div
      data-snapshot-component="alert"
      data-testid="alert"
      data-variant={variant}
      role="alert"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {icon ? (
        <span
          data-testid="alert-icon"
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={icon} size={18} />
        </span>
      ) : null}

      <div
        data-snapshot-id={`${rootId}-content`}
        className={contentSurface.className}
        style={contentSurface.style}
      >
        {title ? (
          <div
            data-testid="alert-title"
            data-snapshot-id={`${rootId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          >
            {title}
          </div>
        ) : null}
        <div
          data-testid="alert-description"
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description}
        </div>

        {onAction && actionLabel ? (
          <ButtonControl
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAction()}
            surfaceId={`${rootId}-action`}
            surfaceConfig={actionSurface.resolvedConfigForWrapper}
            testId="alert-action"
          >
            {actionLabel}
          </ButtonControl>
        ) : null}

        {children}
      </div>

      {dismissible ? (
        <ButtonControl
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          ariaLabel="Dismiss alert"
          surfaceId={`${rootId}-dismiss`}
          surfaceConfig={dismissSurface.resolvedConfigForWrapper}
          testId="alert-dismiss"
        >
          <Icon name="x" size={16} />
        </ButtonControl>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
