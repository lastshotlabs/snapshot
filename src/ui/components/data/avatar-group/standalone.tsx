'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { getInitials } from "../../_base/utils";

/** Size to pixel dimensions. */
const SIZE_MAP: Record<string, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

/** Size to font size for initials. */
const FONT_SIZE_MAP: Record<string, string> = {
  sm: "var(--sn-font-size-xs, 0.625rem)",
  md: "var(--sn-font-size-xs, 0.75rem)",
  lg: "var(--sn-font-size-sm, 0.875rem)",
};

/** Color pair: background + foreground for contrast-aware initials. */
interface ColorPair {
  bg: string;
  fg: string;
}

/** Deterministic color pair from a name string. */
function nameToColorPair(name: string): ColorPair {
  const pairs: ColorPair[] = [
    {
      bg: "var(--sn-color-primary, #2563eb)",
      fg: "var(--sn-color-primary-foreground, #ffffff)",
    },
    {
      bg: "var(--sn-color-success, #16a34a)",
      fg: "var(--sn-color-success-foreground, #ffffff)",
    },
    {
      bg: "var(--sn-color-warning, #f59e0b)",
      fg: "var(--sn-color-warning-foreground, #000000)",
    },
    {
      bg: "var(--sn-color-info, #3b82f6)",
      fg: "var(--sn-color-info-foreground, #ffffff)",
    },
    {
      bg: "var(--sn-color-destructive, #dc2626)",
      fg: "var(--sn-color-destructive-foreground, #ffffff)",
    },
    {
      bg: "var(--sn-color-accent, #8b5cf6)",
      fg: "var(--sn-color-accent-foreground, #ffffff)",
    },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return pairs[Math.abs(hash) % pairs.length]!;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AvatarGroupBaseAvatar {
  /** Display name used for initials fallback and title tooltip. */
  name: string;
  /** Image source URL. */
  src?: string;
}

export interface AvatarGroupBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Array of avatars to display. */
  avatars: AvatarGroupBaseAvatar[];
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Maximum number of avatars to display before +N overflow. */
  max?: number;
  /** Overlap in pixels between adjacent avatars. */
  overlap?: number;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item, image, initials, overflow). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone AvatarGroup — overlapping avatars with +N overflow.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <AvatarGroupBase
 *   avatars={[
 *     { name: "Alice", src: "/avatars/alice.jpg" },
 *     { name: "Bob" },
 *     { name: "Carol", src: "/avatars/carol.jpg" },
 *   ]}
 *   size="md"
 *   max={3}
 * />
 * ```
 */
export function AvatarGroupBase({
  id,
  avatars,
  size = "md",
  max = 5,
  overlap: overlapProp,
  className,
  style,
  slots,
}: AvatarGroupBaseProps) {
  const px = SIZE_MAP[size] ?? 36;
  const overlap = overlapProp ?? Math.round(px * 0.3);
  const rootId = id ?? "avatar-group";

  const displayed = avatars.slice(0, max);
  const overflowCount = avatars.length - max;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {
      overflow: "hidden",
      style: {
        width: px,
        height: px,
        borderRadius: "var(--sn-radius-full, 9999px)",
        border:
          "var(--sn-border-default, 2px) solid var(--sn-color-card, #ffffff)",
        flexShrink: 0,
        position: "relative",
      },
    },
    componentSurface: slots?.item,
  });
  const imageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-image`,
    implementationBase: {
      display: "block",
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
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        width: "100%",
        height: "100%",
        fontSize: FONT_SIZE_MAP[size],
        fontWeight: "var(--sn-font-weight-semibold, 600)",
      },
    },
    componentSurface: slots?.initials,
  });
  const overflowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-overflow`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        width: px,
        height: px,
        borderRadius: "var(--sn-radius-full, 9999px)",
        border:
          "var(--sn-border-default, 2px) solid var(--sn-color-card, #ffffff)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        fontSize: FONT_SIZE_MAP[size],
        fontWeight: "var(--sn-font-weight-semibold, 600)",
        flexShrink: 0,
        position: "relative",
      },
    },
    componentSurface: slots?.overflow,
  });

  return (
    <div
      data-snapshot-component="avatar-group"
      data-snapshot-id={rootId}
      data-testid="avatar-group"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {displayed.map((avatar, i) => (
        <div
          key={`${avatar.name}-${i}`}
          data-snapshot-id={`${rootId}-item`}
          title={avatar.name}
          className={itemSurface.className}
          style={{
            ...(itemSurface.style ?? {}),
            marginLeft: i > 0 ? `-${overlap}px` : undefined,
            zIndex: displayed.length - i,
          }}
        >
          {avatar.src ? (
            <img
              data-snapshot-id={`${rootId}-image`}
              className={imageSurface.className}
              src={avatar.src}
              alt={avatar.name}
              style={imageSurface.style}
            />
          ) : (
            <div
              data-snapshot-id={`${rootId}-initials`}
              className={initialsSurface.className}
              style={{
                ...(initialsSurface.style ?? {}),
                backgroundColor: nameToColorPair(avatar.name).bg,
                color: nameToColorPair(avatar.name).fg,
              }}
            >
              {getInitials(avatar.name) || "?"}
            </div>
          )}
        </div>
      ))}

      {overflowCount > 0 && (
        <div
          data-snapshot-id={`${rootId}-overflow`}
          data-testid="avatar-overflow"
          title={`${overflowCount} more`}
          className={overflowSurface.className}
          style={{
            ...(overflowSurface.style ?? {}),
            marginLeft: `-${overlap}px`,
            zIndex: 0,
          }}
        >
          +{overflowCount}
        </div>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={imageSurface.scopedCss} />
      <SurfaceStyles css={initialsSurface.scopedCss} />
      <SurfaceStyles css={overflowSurface.scopedCss} />
    </div>
  );
}
