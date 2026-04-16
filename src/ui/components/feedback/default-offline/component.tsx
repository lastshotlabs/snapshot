"use client";

import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { OfflineBannerConfig } from "./types";

export function DefaultOffline({ config }: { config: OfflineBannerConfig }) {
  const rootId = config.id ?? "offline-banner";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      style: {
        padding: "var(--sn-spacing-md, 1rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border: "1px solid var(--sn-color-border, #cbd5e1)",
        background: "var(--sn-color-card, #ffffff)",
        color: "var(--sn-color-foreground, #0f172a)",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "base",
      fontWeight: "semibold",
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      fontSize: "sm",
    },
    componentSurface: config.slots?.description,
  });

  return (
    <div
      role="status"
      aria-live="polite"
      data-snapshot-feedback="offline"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <strong
        data-snapshot-id={`${rootId}-title`}
        className={titleSurface.className}
        style={titleSurface.style}
      >
        {config.title ?? "You're offline"}
      </strong>
      <span
        data-snapshot-id={`${rootId}-description`}
        className={descriptionSurface.className}
        style={descriptionSurface.style}
      >
        {config.description ?? "Reconnect to continue working."}
      </span>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
