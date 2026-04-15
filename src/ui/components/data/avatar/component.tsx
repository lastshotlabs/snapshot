'use client';

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { getInitials } from "../../_base/utils";
import type { AvatarConfig } from "./types";

/** Size enum → pixel dimension. */
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

/** Default initials font size fallback. */
const DEFAULT_INITIALS_FONT_SIZE = "var(--sn-font-size-sm, 0.875rem)";

/** Status dot color mapping. */
const STATUS_COLORS: Record<string, string> = {
  online: "var(--sn-color-success, #16a34a)",
  offline: "var(--sn-color-muted-foreground, #6b7280)",
  busy: "var(--sn-color-destructive, #dc2626)",
  away: "var(--sn-color-warning, #f59e0b)",
};

/**
 * Avatar component — a config-driven avatar with image, initials, or icon fallback.
 *
 * Renders an image if `src` is provided, falls back to initials from `name`,
 * then to `icon`, then to a generic placeholder.
 *
 * @param props - Component props containing the avatar configuration
 *
 * @example
 * ```json
 * {
 *   "type": "avatar",
 *   "src": "https://example.com/photo.jpg",
 *   "name": "Jane Doe",
 *   "size": "lg",
 *   "status": "online"
 * }
 * ```
 */
export function Avatar({ config }: { config: AvatarConfig }) {
  const resolvedSrc = useSubscribe(config.src ?? "") as string;
  const resolvedName = useSubscribe(config.name ?? "") as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  const [imgError, setImgError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImgError(false);
  }, [resolvedSrc]);

  useEffect(() => {
    if (publish) {
      publish({ name: resolvedName, src: resolvedSrc });
    }
  }, [publish, resolvedName, resolvedSrc]);

  if (visible === false) return null;

  const size = config.size ?? "md";
  const shape = config.shape ?? "circle";
  const color = config.color ?? "primary";
  const px = SIZE_PX[size] ?? 40;
  const initialsFontSize =
    INITIALS_FONT_SIZE[size] ?? DEFAULT_INITIALS_FONT_SIZE;

  const showImage = resolvedSrc && !imgError;
  const initials = resolvedName ? getInitials(resolvedName) : null;

  const borderRadius =
    shape === "circle"
      ? "var(--sn-radius-full, 9999px)"
      : "var(--sn-radius-md, 0.5rem)";

  const statusDotSize = Math.max(px * 0.25, 8);
  const rootId = config.id ?? "avatar";
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
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.image,
  });
  const initialsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-initials`,
    componentSurface: config.slots?.initials,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    componentSurface: config.slots?.icon,
  });
  const fallbackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fallback`,
    componentSurface: config.slots?.fallback,
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
        backgroundColor: config.status ? STATUS_COLORS[config.status] : undefined,
        border:
          "var(--sn-border-default, 2px) solid var(--sn-color-card, #ffffff)",
      },
    },
    componentSurface: config.slots?.status,
  });

  return (
    <div
      data-snapshot-component="avatar"
      data-snapshot-id={rootId}
      data-testid="avatar"
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      {showImage && (
        <img
          data-snapshot-id={`${rootId}-image`}
          data-testid="avatar-image"
          className={imageSurface.className}
          src={resolvedSrc}
          alt={config.alt ?? resolvedName ?? "Avatar"}
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
      {!showImage && !initials && config.icon && (
        <span
          data-snapshot-id={`${rootId}-icon`}
          data-testid="avatar-icon"
          aria-hidden="true"
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(config.icon, Math.max(16, Math.round(px * 0.4)))}
        </span>
      )}
      {!showImage && !initials && !config.icon && (
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
      {config.status && (
        <span
          data-snapshot-id={`${rootId}-status`}
          data-testid="avatar-status"
          data-status={config.status}
          className={statusSurface.className}
          style={statusSurface.style}
          aria-label={config.status}
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
