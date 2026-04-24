'use client';

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

const ICON_SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const;
const SPACING_MAP = {
  sm: "var(--sn-spacing-md, 1rem)",
  md: "var(--sn-spacing-xl, 2rem)",
  lg: "var(--sn-spacing-xl, 2rem)",
} as const;

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface EmptyStateBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Title text. */
  title: string;
  /** Description text. */
  description?: string;
  /** Icon name. */
  icon?: string;
  /** Icon color token. */
  iconColor?: string;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Action button label. */
  actionLabel?: string;
  /** Callback when the action button is clicked. */
  onAction?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, icon, title, description, action). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone EmptyState — a centered message with optional icon and action.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <EmptyStateBase
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   icon="folder-plus"
 *   actionLabel="Create project"
 *   onAction={() => openCreateDialog()}
 * />
 * ```
 */
export function EmptyStateBase({
  id,
  title,
  description,
  icon,
  iconColor,
  size = "md",
  actionLabel,
  onAction,
  className,
  style,
  slots,
}: EmptyStateBaseProps) {
  const iconSize = ICON_SIZE_MAP[size];
  const spacing = SPACING_MAP[size];
  const rootId = id ?? "empty-state";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      style: {
        padding: spacing,
        gap: "var(--sn-spacing-md, 1rem)",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: iconColor
        ? `var(--sn-color-${iconColor}, ${iconColor})`
        : "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: slots?.icon,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: size === "sm" ? "base" : size === "lg" ? "xl" : "lg",
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
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      maxWidth: "var(--sn-container-md, 400px)",
      lineHeight: "normal",
      style: {
        margin: 0,
      },
    },
    componentSurface: slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    componentSurface: slots?.action,
  });

  return (
    <div
      data-snapshot-component="empty-state"
      data-testid="empty-state"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {icon ? (
        <span
          data-testid="empty-state-icon"
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={icon} size={iconSize} />
        </span>
      ) : null}

      <h3
        data-testid="empty-state-title"
        data-snapshot-id={`${rootId}-title`}
        className={titleSurface.className}
        style={titleSurface.style}
      >
        {title}
      </h3>

      {description ? (
        <p
          data-testid="empty-state-description"
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description}
        </p>
      ) : null}

      {onAction && actionLabel ? (
        <ButtonControl
          variant="default"
          size="md"
          onClick={onAction}
          surfaceId={`${rootId}-action`}
          surfaceConfig={actionSurface.resolvedConfigForWrapper}
          testId="empty-state-action"
        >
          {actionLabel}
        </ButtonControl>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={actionSurface.scopedCss} />
    </div>
  );
}
