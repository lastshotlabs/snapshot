'use client';

import { useMemo } from "react";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { getInitials } from "../../_base/utils";
import type { AvatarGroupConfig } from "./types";

/** Size → pixel dimensions. */
const SIZE_MAP: Record<string, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

/** Size → font size for initials. */
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

/**
 * AvatarGroup — displays a row of overlapping avatars with "+N" overflow.
 *
 * Supports static `avatars` array or API-loaded data. Each avatar shows
 * an image or initials fallback with a deterministic background color.
 *
 * @param props - Component props containing the avatar group configuration
 */
export function AvatarGroup({ config }: { config: AvatarGroupConfig }) {
  const visible = useSubscribe(config.visible ?? true);

  const dataResult = useComponentData(config.data ?? "");

  const size = config.size ?? "md";
  const px = SIZE_MAP[size] ?? 36;
  const max = config.max ?? 5;
  const overlap = config.overlap ?? Math.round(px * 0.3);
  const nameField = config.nameField ?? "name";
  const srcField = config.srcField ?? "avatar";

  // Resolve avatars from static config or API data
  const avatars = useMemo(() => {
    if (config.avatars) {
      return config.avatars;
    }
    if (!dataResult.data) return [];
    const items = Array.isArray(dataResult.data)
      ? dataResult.data
      : ((dataResult.data as Record<string, unknown>).data ??
        (dataResult.data as Record<string, unknown>).items ??
        []);
    if (!Array.isArray(items)) return [];
    return items.map((item: Record<string, unknown>) => ({
      name: String(item[nameField] ?? ""),
      src: item[srcField] ? String(item[srcField]) : undefined,
    }));
  }, [config.avatars, dataResult.data, nameField, srcField]);

  if (visible === false) return null;

  const displayed = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const rootId = config.id ?? "avatar-group";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.item,
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
    componentSurface: config.slots?.image,
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
    componentSurface: config.slots?.initials,
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
    componentSurface: config.slots?.overflow,
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

      {/* +N overflow */}
      {overflow > 0 && (
        <div
          data-snapshot-id={`${rootId}-overflow`}
          data-testid="avatar-overflow"
          title={`${overflow} more`}
          className={overflowSurface.className}
          style={{
            ...(overflowSurface.style ?? {}),
            marginLeft: `-${overlap}px`,
            zIndex: 0,
          }}
        >
          +{overflow}
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
