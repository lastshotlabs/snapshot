'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavLogoBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Logo text label. */
  text?: string;
  /** Logo image source URL. */
  src?: string;
  /** Navigation path when the logo is clicked. */
  path?: string;
  /** Logo height (CSS value). Default: "var(--sn-spacing-lg, 1.5rem)". */
  logoHeight?: string;
  /** Callback fired when the logo is clicked with a navigation path. */
  onNavigate?: (path: string) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, icon, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavLogo -- a clickable brand logo/text element for navigation headers.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NavLogoBase
 *   text="My App"
 *   src="/logo.png"
 *   path="/"
 *   onNavigate={(path) => router.push(path)}
 * />
 * ```
 */
export function NavLogoBase({
  id,
  text,
  src,
  path,
  logoHeight = "var(--sn-spacing-lg, 1.5rem)",
  onNavigate,
  className,
  style,
  slots,
}: NavLogoBaseProps) {
  const handleClick = () => {
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && path) {
      e.preventDefault();
      handleClick();
    }
  };

  const rootId = id ?? "nav-logo";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      cursor: path ? "pointer" : undefined,
      textDecoration: "none",
      flexShrink: 0,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      height: logoHeight,
      width: "auto",
    },
    componentSurface: slots?.icon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)" as CSSProperties["fontWeight"],
      whiteSpace: "nowrap",
    },
    componentSurface: slots?.label,
  });

  return (
    <div
      data-snapshot-component="nav-logo"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={path ? "link" : undefined}
      tabIndex={path ? 0 : undefined}
    >
      {src && (
        <img
          src={src}
          alt={text ?? "Logo"}
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        />
      )}
      {text && (
        <span
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {text}
        </span>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
