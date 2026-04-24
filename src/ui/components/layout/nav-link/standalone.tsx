'use client';

import type { CSSProperties, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavLinkBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Link label text. */
  label?: string;
  /** Navigation path. */
  path: string;
  /** Icon name (resolved via renderIcon). */
  icon?: string;
  /** Badge count to display. */
  badge?: number;
  /** Whether the link is disabled. */
  disabled?: boolean;
  /** Whether the link is currently active. */
  active?: boolean;
  /** Whether child routes should also match for active state. Default: true. */
  matchChildren?: boolean;
  /** Callback fired on navigation. */
  onNavigate?: (path: string) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label, icon, badge). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavLink -- a navigation link with optional icon and badge.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NavLinkBase
 *   label="Dashboard"
 *   path="/dashboard"
 *   icon="home"
 *   active
 *   onNavigate={(path) => router.push(path)}
 * />
 * ```
 */
export function NavLinkBase({
  id,
  label,
  path,
  icon,
  badge,
  disabled = false,
  active,
  onNavigate,
  className,
  style,
  slots,
}: NavLinkBaseProps) {
  const rootId = id ?? path;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-nav-link-gap, var(--sn-spacing-sm, 0.5rem))",
      padding: "var(--sn-nav-link-padding, 0.375rem 0.5rem)",
      width: "100%",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      textDecoration: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      color: "inherit",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      justifyContent: "var(--sn-nav-link-justify, flex-start)",
      transition: "background 0.15s, color 0.15s",
      hover: disabled ? {} : {
        bg: "var(--sn-color-accent)",
      },
      states: {
        current: {
          bg: "var(--sn-color-accent)",
          color: "var(--sn-color-accent-foreground)",
          fontWeight: "500",
        },
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: active ? ["current"] : [],
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: slots?.label,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: slots?.icon,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-badge`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "1.25rem",
      height: "1.25rem",
      borderRadius: "var(--sn-radius-full, 9999px)",
      background: "var(--sn-color-primary)",
      color: "var(--sn-color-primary-foreground)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
    },
    componentSurface: slots?.badge,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    onNavigate?.(path);
  };

  return (
    <div
      data-snapshot-component="nav-link"
      data-snapshot-id={`${rootId}-nav-link`}
      style={{ display: "contents" }}
    >
      <a
        href={path}
        onClick={handleClick}
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
      >
        {icon ? (
          <span
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(icon, 16)}
          </span>
        ) : null}
        {label ? (
          <span
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </span>
        ) : null}
        {badge != null && badge > 0 ? (
          <span
            data-snapshot-id={`${rootId}-badge`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {badge}
          </span>
        ) : null}
      </a>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
    </div>
  );
}
