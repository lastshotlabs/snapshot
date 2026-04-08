import { useState, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
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
  offline: "var(--sn-color-muted, #9ca3af)",
  busy: "var(--sn-color-destructive, #dc2626)",
  away: "var(--sn-color-warning, #f59e0b)",
};

/**
 * Extract initials from a name string.
 * Takes the first letter of the first two words.
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

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
  const initialsFontSize = INITIALS_FONT_SIZE[size] ?? DEFAULT_INITIALS_FONT_SIZE;

  const showImage = resolvedSrc && !imgError;
  const initials = resolvedName ? getInitials(resolvedName) : null;

  const borderRadius =
    shape === "circle"
      ? "var(--sn-radius-full, 9999px)"
      : "var(--sn-radius-md, 0.5rem)";

  const statusDotSize = Math.max(px * 0.25, 8);

  return (
    <div
      data-snapshot-component="avatar"
      data-testid="avatar"
      className={config.className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${px}px`,
        height: `${px}px`,
        borderRadius,
        backgroundColor: showImage
          ? "transparent"
          : `var(--sn-color-${color})`,
        color: showImage
          ? undefined
          : `var(--sn-color-${color}-foreground)`,
        fontSize: INITIALS_FONT_SIZE[size],
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Image */}
      {showImage && (
        <img
          data-testid="avatar-image"
          src={resolvedSrc}
          alt={config.alt ?? resolvedName ?? "Avatar"}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Initials fallback */}
      {!showImage && initials && (
        <span data-testid="avatar-initials" aria-hidden="true">
          {initials}
        </span>
      )}

      {/* Icon fallback */}
      {!showImage && !initials && config.icon && (
        <span data-testid="avatar-icon" aria-hidden="true">
          {config.icon}
        </span>
      )}

      {/* Generic fallback */}
      {!showImage && !initials && !config.icon && (
        <span data-testid="avatar-fallback" aria-hidden="true">
          ?
        </span>
      )}

      {/* Status dot */}
      {config.status && (
        <span
          data-testid="avatar-status"
          data-status={config.status}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: `${statusDotSize}px`,
            height: `${statusDotSize}px`,
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: STATUS_COLORS[config.status],
            border: "2px solid var(--sn-color-card, #ffffff)",
          }}
          aria-label={config.status}
        />
      )}
    </div>
  );
}
