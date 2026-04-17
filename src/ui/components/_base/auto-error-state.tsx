'use client';

import type { ReactNode } from "react";
import { renderIcon } from "../../icons/render";
import { SurfaceStyles } from "./surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "./style-surfaces";
import { ButtonControl } from "../forms/button";

export interface AutoErrorStateConfig extends Record<string, unknown> {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  title?: string;
  description?: string;
  retry?: boolean | { label: string };
  icon?: string;
  slots?: {
    root?: Record<string, unknown>;
    icon?: Record<string, unknown>;
    title?: Record<string, unknown>;
    description?: Record<string, unknown>;
    retry?: Record<string, unknown>;
  };
}

export function AutoErrorState({
  config,
  onRetry,
}: {
  config: AutoErrorStateConfig;
  onRetry?: () => void;
}): ReactNode {
  const retryLabel =
    typeof config.retry === "object" ? config.retry.label : "Retry";
  const showRetry = Boolean(config.retry) && Boolean(onRetry);
  const rootId = config.id ?? "auto-error-state";
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
        gap: "var(--sn-spacing-md, 1rem)",
      },
    },
    componentSurface: extractSurfaceConfig(config as Record<string, unknown>),
    itemSurface: config.slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: "var(--sn-color-destructive, #dc2626)",
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
      fontSize: "lg",
      fontWeight: "semibold",
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
    },
    componentSurface: config.slots?.description,
  });
  const retrySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-retry`,
    componentSurface: config.slots?.retry,
  });

  return (
    <>
      <div
        role="alert"
        data-snapshot-error-state=""
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(config.icon ?? "alert-circle", 28)}
        </div>
        <div
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {config.title ?? "Something went wrong"}
        </div>
        {config.description ? (
          <div
            data-snapshot-id={`${rootId}-description`}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {config.description}
          </div>
        ) : null}
        {showRetry ? (
          <ButtonControl
            type="button"
            surfaceId={`${rootId}-retry`}
            surfaceConfig={retrySurface.resolvedConfigForWrapper}
            onClick={onRetry}
            variant="outline"
            size="sm"
          >
            {retryLabel}
          </ButtonControl>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={retrySurface.scopedCss} />
    </>
  );
}
