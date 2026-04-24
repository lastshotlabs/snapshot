'use client';

import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface BannerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Minimum height of the banner (CSS value). Default: "50vh". */
  height?: string;
  /** Content alignment. Default: "center". */
  align?: "left" | "center" | "right";
  /** Background configuration. */
  background?: {
    /** Background image URL. */
    image?: string;
    /** Background color (CSS value). */
    color?: string;
    /** Overlay color applied over the background (CSS value). */
    overlay?: string;
  };

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, overlay, content). */
  slots?: Record<string, Record<string, unknown>>;

  /** React children rendered as banner content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Banner — a full-width hero section with background, overlay,
 * and content alignment. No manifest context required.
 *
 * @example
 * ```tsx
 * <BannerBase height="60vh" align="center" background={{ color: "#1a1a2e" }}>
 *   <h1>Welcome</h1>
 *   <p>Get started today</p>
 * </BannerBase>
 * ```
 */
export function BannerBase({
  id,
  height = "50vh",
  align = "center",
  background,
  className,
  style,
  slots,
  children,
}: BannerBaseProps) {
  const rootId = id ?? "banner";

  const alignMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      overflow: "hidden",
      style: {
        alignItems: alignMap[align] ?? "center",
        minHeight: height,
        padding: "var(--sn-spacing-xl, 2rem)",
        ...(background?.image
          ? {
              backgroundImage: `url(${background.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {}),
        ...(background?.color ? { backgroundColor: background.color } : {}),
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const overlaySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-overlay`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      style: {
        background: background?.overlay,
        zIndex: 0,
      },
    },
    componentSurface: slots?.overlay,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      style: {
        zIndex: 1,
        alignItems: alignMap[align] ?? "center",
        gap: "var(--sn-spacing-md, 1rem)",
        textAlign: align,
        maxWidth: "var(--sn-container-lg, 42rem)",
      },
    },
    componentSurface: slots?.content,
  });

  return (
    <div
      data-snapshot-component="banner"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {background?.overlay ? (
        <div
          data-snapshot-id={`${rootId}-overlay`}
          className={overlaySurface.className}
          style={overlaySurface.style}
        />
      ) : null}
      <div
        data-snapshot-id={`${rootId}-content`}
        className={contentSurface.className}
        style={contentSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={overlaySurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
