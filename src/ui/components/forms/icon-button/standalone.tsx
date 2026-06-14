'use client';

import type { CSSProperties, MouseEventHandler } from "react";
import type { SlotOverrides } from "../../_base/types";
import { useSnapshotId } from "../../_base/use-snapshot-id";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface IconButtonBaseProps {
  /** Unique identifier. */
  id?: string;
  /** Icon name to render. */
  icon: string;
  /** Accessible label (required for icon-only buttons). */
  ariaLabel: string;
  /** Visual variant. */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Size. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Shape of the button. */
  shape?: "circle" | "square";
  /** Tooltip text. */
  tooltip?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Click handler. */
  onClick?: MouseEventHandler<HTMLButtonElement>;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: SlotOverrides;
}

const SIZE_MAP = {
  xs: { dim: "var(--sn-icon-btn-xs, 1.5rem)", iconSize: 12 },
  sm: { dim: "var(--sn-icon-btn-sm, 2rem)", iconSize: 14 },
  md: { dim: "var(--sn-icon-btn-md, 2.5rem)", iconSize: 16 },
  lg: { dim: "var(--sn-icon-btn-lg, 3rem)", iconSize: 20 },
} as const;

/**
 * Standalone IconButtonBase -- an icon-only button with configurable shape,
 * size, and variant. Works with plain React props.
 *
 * @example
 * ```tsx
 * <IconButtonBase
 *   icon="trash"
 *   ariaLabel="Delete item"
 *   variant="destructive"
 *   size="sm"
 *   onClick={handleDelete}
 * />
 * ```
 */
export function IconButtonBase({
  id,
  icon,
  ariaLabel,
  variant = "ghost",
  size: sizeProp = "md",
  shape = "circle",
  tooltip,
  disabled = false,
  onClick,
  className,
  style,
  slots,
}: IconButtonBaseProps) {
  const size = SIZE_MAP[sizeProp];
  const states = disabled ? (["disabled"] as const) : [];
  const rootId = useSnapshotId(id, "icon-button");
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: slots?.icon,
    activeStates: [...states],
  });

  return (
    <div data-snapshot-component="icon-button">
      <ButtonControl
        type="button"
        variant={variant}
        size="icon"
        disabled={disabled}
        onClick={onClick}
        surfaceId={rootId}
        surfaceConfig={className || style ? { className, style } : undefined}
        itemSurfaceConfig={slots?.root}
        activeStates={[...states]}
        ariaLabel={ariaLabel}
        style={{
          width: size.dim,
          minWidth: size.dim,
          height: size.dim,
          minHeight: size.dim,
          padding: 0,
          borderRadius:
            shape === "square"
              ? "var(--sn-radius-md, 0.375rem)"
              : "var(--sn-radius-full, 9999px)",
        }}
      >
        <span
          title={tooltip ?? ariaLabel}
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(icon, size.iconSize)}
        </span>
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
