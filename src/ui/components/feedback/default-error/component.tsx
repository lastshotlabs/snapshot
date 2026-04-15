"use client";

import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { ErrorPageConfig } from "./types";

export function DefaultError({ config }: { config: ErrorPageConfig }) {
  const rootId = config.id ?? "error-page";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-md, 1rem)",
      style: {
        padding: "var(--sn-spacing-xl, 2rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border: "1px solid var(--sn-color-border, #e2e8f0)",
        background: "var(--sn-color-card, #ffffff)",
        color: "var(--sn-color-foreground, #0f172a)",
      },
    },
    componentSurface: config.slots?.root,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "xl",
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
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: {
        margin: "var(--sn-spacing-xs, 0.25rem) 0 0",
      },
    },
    componentSurface: config.slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    implementationBase: {
      style: {
        alignSelf: "start",
      },
    },
    componentSurface: config.slots?.action,
  });

  return (
    <div
      role="alert"
      data-snapshot-feedback="error"
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      <div>
        <h2
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {config.title ?? "Something went wrong"}
        </h2>
        <p
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {config.description ?? "Please try again."}
        </p>
      </div>
      {config.showRetry ? (
        <ButtonControl
          type="button"
          variant="default"
          size="md"
          onClick={() => window.location.reload()}
          surfaceId={`${rootId}-action`}
          surfaceConfig={actionSurface.resolvedConfigForWrapper}
        >
          {config.retryLabel ?? "Try again"}
        </ButtonControl>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
