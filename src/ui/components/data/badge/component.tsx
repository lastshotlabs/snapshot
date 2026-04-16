'use client';

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { BadgeConfig } from "./types";

const SIZE_MAP = {
  xs: {
    fontSize: "var(--sn-font-size-xs, 0.625rem)",
    padding: "var(--sn-spacing-2xs, 1px) var(--sn-spacing-xs, 0.25rem)",
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

const BG_COLORS = new Set(["secondary", "muted", "accent"]);

function getVariantStyles(
  variant: "solid" | "soft" | "outline" | "dot",
  color: string,
): CSSProperties {
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
            border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
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

export function Badge({ config }: { config: BadgeConfig }) {
  const resolvedText = useSubscribe(config.text) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish && resolvedText) {
      publish({ text: resolvedText });
    }
  }, [publish, resolvedText]);

  if (visible === false) {
    return null;
  }

  const color = config.color ?? "primary";
  const variant = config.variant ?? "soft";
  const size = config.size ?? "md";
  const rounded = config.rounded ?? true;
  const sizeStyles = SIZE_MAP[size];
  const variantStyles = getVariantStyles(variant, color);
  const rootId = config.id ?? "badge";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      fontWeight: "semibold",
      lineHeight: "tight",
      maxWidth: "100%",
      style: {
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        borderRadius: rounded
          ? "var(--sn-radius-full, 9999px)"
          : "var(--sn-radius-sm, 0.25rem)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...variantStyles,
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["color"] }),
    itemSurface: config.slots?.root,
  });
  const dotSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dot`,
    implementationBase: {
      style: {
        width: "0.5rem",
        height: "0.5rem",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: `var(--sn-color-${color})`,
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.dot,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: config.slots?.icon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {},
    componentSurface: config.slots?.label,
  });

  return (
    <span
      data-snapshot-component="badge"
      data-testid="badge"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {variant === "dot" ? (
        <span
          data-testid="badge-dot"
          data-snapshot-id={`${rootId}-dot`}
          aria-hidden="true"
          className={dotSurface.className}
          style={dotSurface.style}
        />
      ) : null}
      {config.icon ? (
        <span
          data-testid="badge-icon"
          data-snapshot-id={`${rootId}-icon`}
          aria-hidden="true"
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={config.icon} size={14} />
        </span>
      ) : null}
      <span
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {resolvedText}
      </span>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={dotSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </span>
  );
}
