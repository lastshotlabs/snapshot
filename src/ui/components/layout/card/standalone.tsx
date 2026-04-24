'use client';

import type { CSSProperties, ReactNode } from "react";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { resolveComponentBackgroundStyle } from "../../_base/background-style";
import type { ComponentBackgroundValue } from "../../_base/background-style";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Gap tokens (shared with manifest variant) ─────────────────────────────────

const GAP_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CardBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Card title. */
  title?: string;
  /** Card subtitle. */
  subtitle?: string;
  /** Content gap — a token name ("sm", "md", "lg") or raw CSS value. */
  gap?: string;
  /** Background config — a CSS color string, or an object with image/gradient/overlay. */
  background?: ComponentBackgroundValue;
  /** Stagger animation delay per child (ms). */
  staggerDelay?: number;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, header, title, subtitle, content, item). */
  slots?: Record<string, Record<string, unknown>>;

  /** React children — rendered as the card body. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Card — a styled container with optional title/subtitle and
 * standard React children. No manifest context required.
 *
 * @example
 * ```tsx
 * <CardBase title="User Profile" subtitle="Account details" gap="lg">
 *   <p>Name: Jane Doe</p>
 *   <p>Email: jane@example.com</p>
 * </CardBase>
 * ```
 */
export function CardBase({
  id,
  title,
  subtitle,
  gap: gapProp,
  background,
  staggerDelay,
  className,
  style,
  slots,
  children,
}: CardBaseProps) {
  const gap = useResponsiveValue(gapProp);
  const resolvedGap = gap ? GAP_MAP[gap] ?? gap : GAP_MAP.md;
  const backgroundStyle = resolveComponentBackgroundStyle(background);
  const rootId = id ?? "card";

  // ── Surface resolution (pure CSS computation — no manifest) ──────────────

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: resolvedGap,
      style: {
        backgroundColor: "var(--sn-color-card, #ffffff)",
        border:
          "var(--sn-card-border, 1px solid var(--sn-color-border, #e5e7eb))",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow:
          "var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)))",
        padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
        ...(backgroundStyle ?? {}),
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
    },
    componentSurface: slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "lg",
      fontWeight: "semibold",
      lineHeight: "tight",
      style: { margin: 0 },
    },
    componentSurface: slots?.title,
  });
  const subtitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-subtitle`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      style: { margin: 0 },
    },
    componentSurface: slots?.subtitle,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: resolvedGap,
    },
    componentSurface: slots?.content,
  });

  return (
    <div
      data-snapshot-component="card"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {(title || subtitle) ? (
        <div
          data-snapshot-id={`${rootId}-header`}
          className={headerSurface.className}
          style={headerSurface.style}
        >
          {title ? (
            <h3
              data-snapshot-id={`${rootId}-title`}
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              data-snapshot-id={`${rootId}-subtitle`}
              className={subtitleSurface.className}
              style={subtitleSurface.style}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        data-snapshot-id={`${rootId}-content`}
        className={contentSurface.className}
        style={contentSurface.style}
      >
        {children}
      </div>

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={subtitleSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
