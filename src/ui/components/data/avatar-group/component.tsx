import { useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
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
  const publish = usePublish(config.id);

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

  return (
    <div
      data-snapshot-component="avatar-group"
      data-testid="avatar-group"
      className={config.className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {displayed.map((avatar, i) => (
        <div
          key={`${avatar.name}-${i}`}
          title={avatar.name}
          style={{
            width: px,
            height: px,
            borderRadius: "var(--sn-radius-full, 9999px)",
            border: "2px solid var(--sn-color-card, #ffffff)",
            overflow: "hidden",
            flexShrink: 0,
            marginLeft: i > 0 ? `-${overlap}px` : undefined,
            position: "relative",
            zIndex: displayed.length - i,
          }}
        >
          {avatar.src ? (
            <img
              src={avatar.src}
              alt={avatar.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: nameToColorPair(avatar.name).bg,
                color: nameToColorPair(avatar.name).fg,
                fontSize: FONT_SIZE_MAP[size],
                fontWeight:
                  "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
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
          data-testid="avatar-overflow"
          title={`${overflow} more`}
          style={{
            width: px,
            height: px,
            borderRadius: "var(--sn-radius-full, 9999px)",
            border: "2px solid var(--sn-color-card, #ffffff)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: FONT_SIZE_MAP[size],
            fontWeight:
              "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
            marginLeft: `-${overlap}px`,
            flexShrink: 0,
            position: "relative",
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
