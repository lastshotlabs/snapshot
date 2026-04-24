'use client';

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

const SIZE_MAP = {
  sm: { button: "sm" as const, icon: 16 },
  md: { button: "md" as const, icon: 20 },
  lg: { button: "lg" as const, icon: 24 },
} as const;

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface FavoriteButtonBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Whether the button is active (favorited). */
  active?: boolean;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Callback when the button is toggled. */
  onToggle?: (active: boolean) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, icon). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone FavoriteButton — a toggle button with a star icon.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <FavoriteButtonBase
 *   active={isFavorited}
 *   size="md"
 *   onToggle={(active) => setFavorited(active)}
 * />
 * ```
 */
export function FavoriteButtonBase({
  id,
  active: activeProp = false,
  size: sizeProp = "md",
  onToggle,
  className,
  style,
  slots,
}: FavoriteButtonBaseProps) {
  const [active, setActive] = useState(activeProp);

  useEffect(() => {
    setActive(activeProp);
  }, [activeProp]);

  const sizeConfig = SIZE_MAP[sizeProp];
  const rootId = id ?? "favorite-button";
  const states = active ? (["selected", "active"] as const) : [];

  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: active
        ? "var(--sn-color-warning, #f59e0b)"
        : "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.icon,
    activeStates: [...states],
  });

  return (
    <div data-snapshot-component="favorite-button">
      <ButtonControl
        variant="ghost"
        size={sizeConfig.button}
        onClick={() => {
          const next = !active;
          setActive(next);
          onToggle?.(next);
        }}
        surfaceId={rootId}
        surfaceConfig={className || style ? { className, style } : undefined}
        itemSurfaceConfig={slots?.root}
        activeStates={[...states]}
        ariaLabel={active ? "Remove from favorites" : "Add to favorites"}
        ariaPressed={active}
        testId="favorite-button"
        style={{
          padding: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        <span
          data-snapshot-id={`${rootId}-icon`}
          data-active={active}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name="star" size={sizeConfig.icon} />
        </span>
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
