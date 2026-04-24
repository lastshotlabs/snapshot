'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

const LINE_WIDTHS = ["100%", "90%", "75%", "60%", "85%", "70%", "95%", "65%"];
const PULSE_KEYFRAMES = `
  @keyframes sn-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: var(--sn-opacity-muted, 0.5); }
  }
`;

function toCss(value: string | number | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SkeletonBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Skeleton variant. */
  variant?: "text" | "circular" | "rectangular" | "card";
  /** Whether the skeleton pulses. */
  animated?: boolean;
  /** Number of lines for the text variant. */
  lines?: number;
  /** Width (CSS value or number in px). */
  width?: string | number;
  /** Height (CSS value or number in px). */
  height?: string | number;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, shape, line, title, body). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Skeleton — a placeholder loading indicator.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SkeletonBase
 *   variant="card"
 *   animated
 *   width="100%"
 *   height="200px"
 * />
 * ```
 */
export function SkeletonBase({
  id,
  variant = "text",
  animated = true,
  lines = 3,
  width,
  height,
  className,
  style,
  slots,
}: SkeletonBaseProps) {
  const rootId = id ?? "skeleton";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase:
      variant === "card"
        ? {
            width: toCss(width, "100%"),
            style: {
              height: toCss(height, "200px"),
              backgroundColor: "var(--sn-color-card, #ffffff)",
              borderRadius: "var(--sn-radius-lg, 0.75rem)",
              border:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
              padding: "var(--sn-spacing-lg, 1.5rem)",
            },
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-md, 1rem)",
          }
        : variant === "text"
          ? {
              display: "flex",
              flexDirection: "column",
              gap: "var(--sn-spacing-sm, 0.5rem)",
              width: toCss(width, "100%"),
            }
          : {},
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: animated ? ["active"] : [],
  });
  const shapeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-shape`,
    implementationBase: {
      style: {
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
      },
    },
    componentSurface: slots?.shape ?? slots?.line,
    activeStates: animated ? ["active"] : [],
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      style: {
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
      },
    },
    componentSurface: slots?.title,
    activeStates: animated ? ["active"] : [],
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-body`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      flex: "1",
    },
    componentSurface: slots?.body,
    activeStates: animated ? ["active"] : [],
  });

  const animationStyle = animated
    ? "sn-pulse var(--sn-duration-slow, 2s) var(--sn-ease-in-out, ease-in-out) infinite"
    : "none";

  if (variant === "text") {
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            data-snapshot-id={`${rootId}-line`}
            className={shapeSurface.className}
            style={{
              ...(shapeSurface.style ?? {}),
              width: LINE_WIDTHS[index % LINE_WIDTHS.length],
              height: "var(--sn-font-size-md, 1rem)",
              animation: animationStyle,
            }}
          />
        ))}
        <SurfaceStyles css={animated ? PULSE_KEYFRAMES : undefined} />
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={shapeSurface.scopedCss} />
      </div>
    );
  }

  if (variant === "circular") {
    const size = toCss(width, "48px");
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-shape`}
          className={shapeSurface.className}
          style={{
            ...(shapeSurface.style ?? {}),
            width: size,
            height: toCss(height, size),
            borderRadius: "var(--sn-radius-full, 9999px)",
            animation: animationStyle,
          }}
        />
        <SurfaceStyles css={animated ? PULSE_KEYFRAMES : undefined} />
        <SurfaceStyles css={shapeSurface.scopedCss} />
      </div>
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-shape`}
          className={shapeSurface.className}
          style={{
            ...(shapeSurface.style ?? {}),
            width: toCss(width, "100%"),
            height: toCss(height, "100px"),
            animation: animationStyle,
          }}
        />
        <SurfaceStyles css={animated ? PULSE_KEYFRAMES : undefined} />
        <SurfaceStyles css={shapeSurface.scopedCss} />
      </div>
    );
  }

  // card variant
  return (
    <div
      data-snapshot-component="skeleton"
      data-testid="skeleton"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-title`}
        className={titleSurface.className}
        style={{
          ...(titleSurface.style ?? {}),
          width: "60%",
          height: "var(--sn-font-size-lg, 1.125rem)",
          animation: animationStyle,
        }}
      />
      <div
        data-snapshot-id={`${rootId}-body`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        {["100%", "85%", "70%"].map((w, index) => (
          <div
            key={index}
            data-snapshot-id={`${rootId}-line`}
            className={shapeSurface.className}
            style={{
              ...(shapeSurface.style ?? {}),
              width: w,
              height: "var(--sn-font-size-md, 1rem)",
              animation: animationStyle,
            }}
          />
        ))}
      </div>
      <SurfaceStyles css={animated ? PULSE_KEYFRAMES : undefined} />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={shapeSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
    </div>
  );
}
