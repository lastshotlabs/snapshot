'use client';

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { getInitials } from "../../_base/utils";

/** Size enum to pixel dimension. */
const SIZE_PX: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/** Font sizes scaled to avatar size. */
const INITIALS_FONT_SIZE: Record<string, string> = {
  xs: "var(--sn-font-size-xs, 0.75rem)",
  sm: "var(--sn-font-size-xs, 0.75rem)",
  md: "var(--sn-font-size-sm, 0.875rem)",
  lg: "var(--sn-font-size-md, 1rem)",
  xl: "var(--sn-font-size-lg, 1.25rem)",
};

const DEFAULT_INITIALS_FONT_SIZE = "var(--sn-font-size-sm, 0.875rem)";

/** Status dot color mapping. */
const STATUS_COLORS: Record<string, string> = {
  online: "var(--sn-color-success, #16a34a)",
  offline: "var(--sn-color-muted-foreground, #6b7280)",
  busy: "var(--sn-color-destructive, #dc2626)",
  away: "var(--sn-color-warning, #f59e0b)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AvatarBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Image source URL. */
  src?: string;
  /** Display name — used for initials fallback. */
  name?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Size variant. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape variant. */
  shape?: "circle" | "square";
  /** Semantic color token for background. */
  color?: string;
  /** Fallback icon name. */
  icon?: string;
  /** Online status indicator. */
  status?: "online" | "offline" | "busy" | "away";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, image, initials, icon, fallback, status). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Avatar — image, initials, or icon fallback.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <AvatarBase
 *   src="/avatars/jane.jpg"
 *   name="Jane Doe"
 *   size="lg"
 *   shape="circle"
 *   status="online"
 * />
 * ```
 */
export function AvatarBase({
  id,
  src,
  name,
  alt,
  size = "md",
  shape = "circle",
  color = "primary",
  icon,
  status,
  className,
  style,
  slots,
}: AvatarBaseProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const px = SIZE_PX[size] ?? 40;
  const initialsFontSize = INITIALS_FONT_SIZE[size] ?? DEFAULT_INITIALS_FONT_SIZE;
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : null;
  const borderRadius =
    shape === "circle"
      ? "var(--sn-radius-full, 9999px)"
      : "var(--sn-radius-md, 0.5rem)";
  const statusDotSize = Math.max(px * 0.25, 8);
  const rootId = id ?? "avatar";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      style: {
        width: `${px}px`,
        height: `${px}px`,
        borderRadius,
        backgroundColor: showImage ? "transparent" : `var(--sn-color-${color})`,
        color: showImage ? undefined : `var(--sn-color-${color}-foreground)`,
        fontSize: initialsFontSize,
        fontWeight: "var(--sn-font-weight-semibold, 600)",
        flexShrink: 0,
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const imageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-image`,
    implementationBase: {
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    },
    componentSurface: slots?.image,
  });
  const initialsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-initials`,
    componentSurface: slots?.initials,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    componentSurface: slots?.icon,
  });
  const fallbackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fallback`,
    componentSurface: slots?.fallback,
  });
  const statusSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-status`,
    implementationBase: {
      position: "absolute",
      style: {
        bottom: 0,
        right: 0,
        width: `${statusDotSize}px`,
        height: `${statusDotSize}px`,
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: status ? STATUS_COLORS[status] : undefined,
        border:
          "var(--sn-border-default, 2px) solid var(--sn-color-card, #ffffff)",
      },
    },
    componentSurface: slots?.status,
  });

  return (
    <div
      data-snapshot-component="avatar"
      data-snapshot-id={rootId}
      data-testid="avatar"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {showImage && (
        <img
          data-snapshot-id={`${rootId}-image`}
          data-testid="avatar-image"
          className={imageSurface.className}
          src={src}
          alt={alt ?? name ?? "Avatar"}
          onError={() => setImgError(true)}
          style={imageSurface.style}
        />
      )}
      {!showImage && initials && (
        <span
          data-snapshot-id={`${rootId}-initials`}
          data-testid="avatar-initials"
          aria-hidden="true"
          className={initialsSurface.className}
          style={initialsSurface.style}
        >
          {initials}
        </span>
      )}
      {!showImage && !initials && icon && (
        <span
          data-snapshot-id={`${rootId}-icon`}
          data-testid="avatar-icon"
          aria-hidden="true"
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(icon, Math.max(16, Math.round(px * 0.4)))}
        </span>
      )}
      {!showImage && !initials && !icon && (
        <span
          data-avatar-fallback=""
          data-snapshot-id={`${rootId}-fallback`}
          data-testid="avatar-fallback"
          aria-hidden="true"
          className={fallbackSurface.className}
          style={fallbackSurface.style}
        >
          ?
        </span>
      )}
      {status && (
        <span
          data-snapshot-id={`${rootId}-status`}
          data-testid="avatar-status"
          data-status={status}
          className={statusSurface.className}
          style={statusSurface.style}
          aria-label={status}
        />
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={imageSurface.scopedCss} />
      <SurfaceStyles css={initialsSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={fallbackSurface.scopedCss} />
      <SurfaceStyles css={statusSurface.scopedCss} />
    </div>
  );
}
