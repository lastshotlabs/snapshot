'use client';

import type { CSSProperties } from "react";
import type { SlotOverrides } from "../../_base/types";
import { useSnapshotId } from "../../_base/use-snapshot-id";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { getButtonStyle, BUTTON_INTERACTIVE_CSS } from "../../_base/button-styles";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isClientNavigableHref(to: string): boolean {
  return /^\/(?!\/)/.test(to);
}

function getVariantSurfaceBase(
  variant: "default" | "muted" | "button" | "navigation",
  disabled?: boolean,
): Record<string, unknown> {
  if (variant === "button") {
    return {
      ...getButtonStyle("default", "md", disabled),
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--sn-spacing-xs, 0.5rem)",
      style: {
        textDecoration: "none",
      },
    };
  }

  if (variant === "navigation") {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "var(--sn-nav-link-justify, flex-start)",
      gap: "var(--sn-nav-link-gap, var(--sn-spacing-sm, 0.5rem))",
      minHeight: "2.25rem",
      padding: "var(--sn-nav-link-padding, 0.25rem 0.75rem)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      color: "var(--sn-color-foreground, #111827)",
      whiteSpace: "nowrap",
      minWidth: 0,
      style: {
        textDecoration: "none",
        boxSizing: "border-box",
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--sn-spacing-xs, 0.25rem)",
    color:
      variant === "muted"
        ? "var(--sn-color-muted-foreground)"
        : "var(--sn-color-primary)",
    style: {
      textDecoration: "none",
      textUnderlineOffset: "0.18em",
      transition:
        "color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), text-decoration-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
    },
  };
}

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface LinkBaseProps {
  /** Link display text. */
  text: string;
  /** Link destination URL. */
  to: string;
  /** Icon name rendered before the label. */
  icon?: string;
  /** Badge text rendered after the label. */
  badge?: string;
  /** Open link in a new tab. */
  external?: boolean;
  /** Disable the link. */
  disabled?: boolean;
  /** Whether this link represents the current page. */
  current?: boolean;
  /** Text alignment. */
  align?: "left" | "center" | "right";
  /** Visual variant. */
  variant?: "default" | "muted" | "button" | "navigation";
  /** Client-side navigation callback — called instead of default behavior. */
  onNavigate?: (to: string) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label, icon, badge). */
  slots?: SlotOverrides;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone Link — renders a styled anchor element with optional icon and
 * badge. Works with plain React props.
 *
 * @example
 * ```tsx
 * <LinkBase text="Documentation" to="/docs" icon="book" variant="default" />
 * ```
 */
export function LinkBase({
  text,
  to,
  icon,
  badge,
  external = false,
  disabled = false,
  current = false,
  align = "left",
  variant = "default",
  onNavigate,
  id,
  className,
  style,
  slots,
}: LinkBaseProps) {
  const rootId = useSnapshotId(id, "link");
  const isDisabled = disabled;
  const isCurrent = current;
  const isButtonVariant = variant === "button";
  const hoverSurface = isDisabled
    ? undefined
    : isButtonVariant
      ? undefined
      : variant === "navigation"
        ? {
            bg: "var(--sn-color-accent, #f3f4f6)",
            color: "var(--sn-color-foreground, #111827)",
          }
        : {
            color:
              variant === "muted"
                ? "var(--sn-color-foreground, #111827)"
                : "color-mix(in oklch, var(--sn-color-primary, #2563eb) 82%, var(--sn-color-foreground, #111827))",
            textDecoration: "underline",
            textDecorationColor: "currentColor",
            textDecorationThickness: "0.09em",
          };
  const activeSurface = isDisabled
    ? undefined
    : isButtonVariant
      ? undefined
      : { transform: "translateY(1px)" };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      ...getVariantSurfaceBase(variant, isDisabled),
      cursor: isDisabled ? "not-allowed" : "pointer",
      textAlign: align,
      hover: hoverSurface,
      focus: {
        ring: true,
      },
      active: activeSurface,
      states: {
        current:
          variant === "navigation"
            ? {
                bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent)",
                color: "var(--sn-color-foreground, #111827)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
              }
            : undefined,
        disabled: {
          opacity: "var(--sn-opacity-disabled, 0.5)",
        },
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: [isCurrent ? "current" : undefined, isDisabled ? "disabled" : undefined].filter(
      Boolean,
    ) as Array<"current" | "disabled">,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    componentSurface: slots?.label,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      style: { flexShrink: 0 },
    },
    componentSurface: slots?.icon,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-badge`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 var(--sn-spacing-xs, 0.25rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      bg: "var(--sn-color-secondary, #f1f5f9)",
      color: "var(--sn-color-secondary-foreground, #111827)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
    },
    componentSurface: slots?.badge,
  });

  const contents = (
    <>
      {icon ? (
        <span
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(icon, 16)}
        </span>
      ) : null}
      <span
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {text}
      </span>
      {badge ? (
        <span
          data-snapshot-id={`${rootId}-badge`}
          className={badgeSurface.className}
          style={badgeSurface.style}
        >
          {badge}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      <a
        data-snapshot-component="link"
        data-snapshot-id={`${rootId}-root`}
        data-sn-button={isButtonVariant ? "" : undefined}
        data-variant={isButtonVariant ? "default" : undefined}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        href={to}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        aria-current={isCurrent ? "page" : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }

          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          if (!isClientNavigableHref(to) || external) {
            return;
          }

          event.preventDefault();
          if (onNavigate) {
            onNavigate(to);
          }
        }}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {contents}
      </a>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
      {isButtonVariant ? <SurfaceStyles css={BUTTON_INTERACTIVE_CSS} /> : null}
    </>
  );
}
