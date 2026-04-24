'use client';

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation, extractSurfaceConfig } from "../../_base/style-surfaces";
import { ButtonControl } from "./control";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ButtonBaseProps {
  /** Unique identifier for the button. Used for surface scoping. */
  id?: string;
  /** Button label text. */
  label?: string;
  /** Icon name displayed before the label. */
  icon?: string;
  /** Visual variant. */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Size of the button. */
  size?: "sm" | "md" | "lg" | "icon";
  /** Disabled state. */
  disabled?: boolean;
  /** Whether the button spans full width. */
  fullWidth?: boolean;
  /** Click handler. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** HTML button type. */
  type?: "button" | "submit";
  /** Accessible label for icon-only buttons. */
  ariaLabel?: string;
  /** Children to render inside the button (overrides label/icon). */
  children?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label, icon). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ButtonBase -- a styled button that works with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ButtonBase
 *   label="Save"
 *   icon="check"
 *   variant="default"
 *   onClick={() => save()}
 * />
 * ```
 */
export function ButtonBase({
  id,
  label,
  icon,
  variant = "default",
  size = "md",
  disabled = false,
  fullWidth,
  onClick,
  type = "button",
  ariaLabel,
  children,
  className,
  style,
  slots,
}: ButtonBaseProps) {
  const rootId = id ?? "button-root";
  const isIconOnly = icon != null && !label && !children;
  const resolvedAriaLabel = ariaLabel ?? (isIconOnly ? icon : undefined);

  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: slots?.label,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    componentSurface: slots?.icon ?? slots?.leadingIcon,
  });

  return (
    <div data-snapshot-component="button">
      <ButtonControl
        type={type}
        variant={variant}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
        onClick={onClick}
        ariaLabel={resolvedAriaLabel}
        surfaceId={rootId}
        surfaceConfig={className || style ? { className, style } : undefined}
        itemSurfaceConfig={slots?.root}
      >
        {children ?? (
          <>
            {icon ? (
              <span
                data-snapshot-id={`${rootId}-icon`}
                className={iconSurface.className}
                style={iconSurface.style}
              >
                {renderIcon(icon, 16)}
              </span>
            ) : null}
            <span
              data-snapshot-id={`${rootId}-label`}
              className={labelSurface.className}
              style={labelSurface.style}
            >
              {label}
            </span>
          </>
        )}
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
