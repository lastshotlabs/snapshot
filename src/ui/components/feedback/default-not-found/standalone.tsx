"use client";

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface DefaultNotFoundBaseProps {
  /** Pre-resolved title text. */
  title?: string;
  /** Pre-resolved description text. */
  description?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, eyebrow, title, description). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultNotFound — renders a 404 page with title and description.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <DefaultNotFoundBase
 *   title="Page not found"
 *   description="The page you are looking for does not exist."
 * />
 * ```
 */
export function DefaultNotFoundBase({
  title,
  description,
  id,
  className,
  style,
  slots,
}: DefaultNotFoundBaseProps) {
  const rootId = id ?? "not-found";
  const componentSurface = className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      minHeight: "100vh",
      display: "grid",
      style: {
        placeItems: "center",
        padding: "var(--sn-spacing-2xl, 3rem)",
        background: "var(--sn-color-background, #f8fafc)",
        color: "var(--sn-color-foreground, #0f172a)",
      },
    },
    componentSurface,
    itemSurface: slots?.root,
  });
  const eyebrowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-eyebrow`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      fontSize: "xs",
      style: {
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      },
    },
    componentSurface: slots?.eyebrow,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "4xl",
      fontWeight: "bold",
      style: { margin: 0 },
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: { margin: 0 },
    },
    componentSurface: slots?.description,
  });

  return (
    <main
      aria-labelledby="snapshot-not-found-title"
      data-snapshot-feedback="not-found"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <section
        style={{
          maxWidth: "32rem",
          textAlign: "center",
          display: "grid",
          gap: "var(--sn-spacing-md, 1rem)",
        }}
      >
        <p
          data-snapshot-id={`${rootId}-eyebrow`}
          className={eyebrowSurface.className}
          style={eyebrowSurface.style}
        >
          404
        </p>
        <h1
          id="snapshot-not-found-title"
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title ?? "Page not found"}
        </h1>
        <p
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description ?? "The page you are looking for does not exist."}
        </p>
      </section>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={eyebrowSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </main>
  );
}
