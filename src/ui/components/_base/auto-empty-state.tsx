'use client';

import type { ReactNode } from "react";
import { useActionExecutor } from "../../actions/executor";
import type { ActionConfig } from "../../actions/types";
import { useSubscribe } from "../../context/hooks";
import { renderIcon } from "../../icons/render";
import { SurfaceStyles } from "./surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "./style-surfaces";
import { ButtonControl } from "../forms/button";

export interface AutoEmptyStateConfig extends Record<string, unknown> {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  action?: {
    label?: string;
    action: ActionConfig | ActionConfig[];
    icon?: string;
    variant?: "default" | "primary" | "outline";
  };
  slots?: {
    root?: Record<string, unknown>;
    icon?: Record<string, unknown>;
    title?: Record<string, unknown>;
    description?: Record<string, unknown>;
    action?: Record<string, unknown>;
  };
}

export function AutoEmptyState({
  config,
}: {
  config: AutoEmptyStateConfig;
}): ReactNode {
  const execute = useActionExecutor();
  const title = useSubscribe(config.title) as string | undefined;
  const description = useSubscribe(config.description) as string | undefined;
  const actionLabel = useSubscribe(config.action?.label) as string | undefined;
  const rootId = config.id ?? "auto-empty-state";
  const size = config.size ?? "md";
  const iconSize = size === "sm" ? 20 : size === "lg" ? 36 : 28;
  const spacing = size === "sm"
    ? "var(--sn-spacing-md, 1rem)"
    : size === "lg"
      ? "var(--sn-spacing-xl, 2rem)"
      : "var(--sn-spacing-lg, 1.5rem)";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      style: {
        padding: "var(--sn-spacing-2xl, 3rem) var(--sn-spacing-xl, 2rem)",
        gap: spacing,
      },
    },
    componentSurface: extractSurfaceConfig(
      config as unknown as Record<string, unknown>,
    ),
    itemSurface: config.slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: config.iconColor
        ? `var(--sn-color-${config.iconColor}, ${config.iconColor})`
        : "var(--sn-color-muted-foreground, #6b7280)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: config.slots?.icon,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: size === "sm" ? "base" : size === "lg" ? "xl" : "lg",
      fontWeight: "semibold",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      lineHeight: "normal",
      maxWidth: "32rem",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    componentSurface: config.slots?.action,
  });

  return (
    <>
      <div
        data-snapshot-empty-state=""
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {config.icon ? (
          <div
            aria-hidden="true"
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(config.icon, iconSize)}
          </div>
        ) : null}
        <div
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title ?? "No data"}
        </div>
        {description ? (
          <div
            data-snapshot-id={`${rootId}-description`}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {description}
          </div>
        ) : null}
        {config.action ? (
          <ButtonControl
            type="button"
            surfaceId={`${rootId}-action`}
            surfaceConfig={actionSurface.resolvedConfigForWrapper}
            variant={
              config.action.variant === "primary"
                ? "default"
                : config.action.variant ?? "outline"
            }
            size="sm"
            onClick={() => void execute(config.action!.action)}
          >
            {config.action.icon ? (
              <span style={{ display: "inline-flex", marginRight: "0.5rem" }}>
                {renderIcon(config.action.icon, 14)}
              </span>
            ) : null}
            {actionLabel ?? "Action"}
          </ButtonControl>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={actionSurface.scopedCss} />
    </>
  );
}
