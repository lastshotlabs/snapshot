"use client";

import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SpinnerConfig } from "./types";

export function DefaultLoading({ config }: { config: SpinnerConfig }) {
  const size = config.size ?? "md";
  const diameter = size === "sm" ? "1rem" : size === "lg" ? "2rem" : "1.5rem";
  const rootId = config.id ?? "spinner";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: {
        placeItems: "center",
        padding: "var(--sn-spacing-lg, 1.5rem)",
      },
    },
    componentSurface: config.slots?.root,
    activeStates: ["active"],
  });
  const spinnerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-spinner`,
    implementationBase: {
      borderRadius: "full",
      style: {
        width: diameter,
        height: diameter,
        border: "2px solid var(--sn-color-border, #cbd5e1)",
        borderTopColor: "var(--sn-color-primary, #0f172a)",
        animation: "sn-spin 0.8s linear infinite",
      },
    },
    componentSurface: config.slots?.spinner,
    activeStates: ["active"],
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
    },
    componentSurface: config.slots?.label,
    activeStates: ["active"],
  });

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-snapshot-feedback="loading"
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      <span
        aria-hidden="true"
        data-snapshot-id={`${rootId}-spinner`}
        className={spinnerSurface.className}
        style={spinnerSurface.style}
      />
      <span
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {config.label ?? "Loading"}
      </span>
      <style>{`
        @keyframes sn-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={spinnerSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
