"use client";

import type { CSSProperties, ReactNode } from "react";
import type { SlotOverrides } from "../_base/types";
import { SurfaceStyles } from "../_base/surface-styles";
import { resolveSurfacePresentation } from "../_base/style-surfaces";
import { ButtonControl } from "../forms/button";

// ── Props ───────────────────────────────────────────────────────────────────

export interface FeedbackStateAction {
  /** Button label text. */
  label: string;
  /** Visual variant forwarded to `ButtonControl`. */
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "link";
  /** Click handler. */
  onClick: () => void;
}

export interface FeedbackStateBaseProps {
  /** Title text rendered inside the heading element. */
  title: string;
  /** Description text rendered below the title. */
  description: string;

  /** Optional action button rendered below the copy block. */
  action?: FeedbackStateAction;

  // ── ARIA ─────────────────────────────────────────────────────────────────
  /** ARIA role for the root element. Defaults to `"status"`. */
  role?: "alert" | "status";
  /** ARIA live region politeness. Defaults to `"polite"`. */
  ariaLive?: "polite" | "assertive" | "off";
  /** Value of the `data-snapshot-feedback` attribute. */
  feedbackType: string;

  // ── Surface / Slot configuration ────────────────────────────────────────
  /** Surface ID prefix used for scoped style resolution. */
  surfaceId: string;
  /** Implementation-base surface config for the root wrapper. */
  rootSurfaceBase: Record<string, unknown>;
  /** Implementation-base surface config for the title element. */
  titleSurfaceBase: Record<string, unknown>;
  /** Implementation-base surface config for the description element. */
  descriptionSurfaceBase: Record<string, unknown>;
  /** Implementation-base surface config for the action button wrapper. */
  actionSurfaceBase?: Record<string, unknown>;

  // ── Style / Slot overrides (forwarded from the outer component) ─────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, title, description, action). */
  slots?: SlotOverrides;

  /**
   * Tag for the title element. Defaults to `"h2"`.
   * Offline uses `"strong"` for a banner-style heading.
   */
  titleTag?: "h2" | "strong";
  /**
   * Tag for the description element. Defaults to `"p"`.
   * Offline uses `"span"` for a banner-style description.
   */
  descriptionTag?: "p" | "span";

  /** Extra children rendered after the action button (e.g. an icon). */
  children?: ReactNode;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Shared feedback-state card used by `DefaultErrorBase` and `DefaultOfflineBase`.
 *
 * Renders a title + description + optional action button inside a styled card
 * with ARIA attributes and `data-snapshot-feedback` identification.
 *
 * This is an internal primitive — app authors should use the domain-specific
 * feedback components (`DefaultErrorBase`, `DefaultOfflineBase`, etc.) instead.
 */
export function FeedbackStateBase({
  title,
  description,
  action,
  role = "status",
  ariaLive = "polite",
  feedbackType,
  surfaceId,
  rootSurfaceBase,
  titleSurfaceBase,
  descriptionSurfaceBase,
  actionSurfaceBase,
  className,
  style,
  slots,
  titleTag: TitleTag = "h2",
  descriptionTag: DescriptionTag = "p",
  children,
}: FeedbackStateBaseProps) {
  const componentSurface =
    className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: rootSurfaceBase,
    componentSurface,
    itemSurface: slots?.root,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${surfaceId}-title`,
    implementationBase: titleSurfaceBase,
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${surfaceId}-description`,
    implementationBase: descriptionSurfaceBase,
    componentSurface: slots?.description,
  });

  const resolvedActionSurface =
    action && actionSurfaceBase
      ? resolveSurfacePresentation({
          surfaceId: `${surfaceId}-action`,
          implementationBase: actionSurfaceBase,
          componentSurface: slots?.action,
        })
      : undefined;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      data-snapshot-feedback={feedbackType}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div>
        <TitleTag
          data-snapshot-id={`${surfaceId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title}
        </TitleTag>
        <DescriptionTag
          data-snapshot-id={`${surfaceId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description}
        </DescriptionTag>
      </div>
      {action && resolvedActionSurface ? (
        <ButtonControl
          type="button"
          variant={action.variant ?? "default"}
          size="md"
          onClick={action.onClick}
          surfaceId={`${surfaceId}-action`}
          surfaceConfig={resolvedActionSurface.resolvedConfigForWrapper}
        >
          {action.label}
        </ButtonControl>
      ) : null}
      {children}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      {resolvedActionSurface ? (
        <SurfaceStyles css={resolvedActionSurface.scopedCss} />
      ) : null}
    </div>
  );
}
