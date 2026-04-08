import { useSubscribe, usePublish } from "../../../context/hooks";
import { useEffect } from "react";
import { Icon } from "../../../icons/index";
import type { BadgeConfig } from "./types";

/** Size → font-size token + padding values. */
const SIZE_MAP = {
  xs: {
    fontSize: "var(--sn-font-size-xs, 0.625rem)",
    padding: "1px var(--sn-spacing-xs, 0.25rem)",
  },
  sm: {
    fontSize: "var(--sn-font-size-xs, 0.75rem)",
    padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
  },
  md: {
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
  },
  lg: {
    fontSize: "var(--sn-font-size-md, 1rem)",
    padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
  },
} as const;

/**
 * Colors where the base token is a near-white/dark background, not a vivid
 * accent.  These need special handling — their `-foreground` companion is
 * the readable text color, not the base value itself.
 */
const BG_COLORS = new Set(["secondary", "muted", "accent"]);

/**
 * Resolve variant-specific styles for a badge.
 */
function getVariantStyles(
  variant: "solid" | "soft" | "outline" | "dot",
  color: string,
): React.CSSProperties {
  const isBgColor = BG_COLORS.has(color);

  switch (variant) {
    case "solid":
      return {
        backgroundColor: `var(--sn-color-${color})`,
        color: `var(--sn-color-${color}-foreground)`,
      };
    case "soft":
      return isBgColor
        ? {
            backgroundColor: `var(--sn-color-${color})`,
            color: `var(--sn-color-${color}-foreground)`,
          }
        : {
            backgroundColor: `color-mix(in oklch, var(--sn-color-${color}) 15%, var(--sn-color-card, #ffffff))`,
            color: `var(--sn-color-${color})`,
          };
    case "outline":
      return isBgColor
        ? {
            backgroundColor: "transparent",
            border: `var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)`,
            color: `var(--sn-color-${color}-foreground)`,
          }
        : {
            backgroundColor: "transparent",
            border: `var(--sn-border-thin, 1px) solid var(--sn-color-${color})`,
            color: `var(--sn-color-${color})`,
          };
    case "dot":
      return {
        backgroundColor: "var(--sn-color-secondary)",
        color: "var(--sn-color-secondary-foreground)",
      };
  }
}

/**
 * Badge component — a config-driven badge/pill for labels, statuses, and counts.
 *
 * Supports solid, soft, outline, and dot variants with semantic color tokens.
 *
 * @param props - Component props containing the badge configuration
 *
 * @example
 * ```json
 * {
 *   "type": "badge",
 *   "text": "Active",
 *   "color": "success",
 *   "variant": "soft",
 *   "size": "md"
 * }
 * ```
 */
export function Badge({ config }: { config: BadgeConfig }) {
  const resolvedText = useSubscribe(config.text) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish && resolvedText) {
      publish({ text: resolvedText });
    }
  }, [publish, resolvedText]);

  if (visible === false) return null;

  const color = config.color ?? "primary";
  const variant = config.variant ?? "soft";
  const size = config.size ?? "md";
  const rounded = config.rounded ?? true;

  const sizeStyles = SIZE_MAP[size];
  const variantStyles = getVariantStyles(variant, color);

  return (
    <span
      data-snapshot-component="badge"
      data-testid="badge"
      className={config.className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        lineHeight: 1.2,
        borderRadius: rounded
          ? "var(--sn-radius-full, 9999px)"
          : "var(--sn-radius-sm, 0.25rem)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
        ...variantStyles,
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Dot indicator for "dot" variant */}
      {variant === "dot" && (
        <span
          data-testid="badge-dot"
          style={{
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: `var(--sn-color-${color})`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
      {/* Icon */}
      {config.icon && (
        <span data-testid="badge-icon" aria-hidden="true">
          <Icon name={config.icon} size={14} />
        </span>
      )}
      {resolvedText}
    </span>
  );
}
