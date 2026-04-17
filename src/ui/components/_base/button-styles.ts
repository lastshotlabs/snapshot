import type { CSSProperties } from "react";

/**
 * Shared button variant + size styles for config-driven components.
 *
 * Every component that renders action/CTA buttons should use these instead
 * of defining ad-hoc inline styles. This ensures consistent appearance,
 * hover/focus behavior, and token usage across the entire UI layer.
 *
 * Buttons rendered with these styles must include `data-sn-button=""` and
 * `data-variant={variant}` attributes for hover/focus CSS to apply.
 */

/** Supported button variant names. */
export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

/** Supported button size names. */
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/** Returns inline styles for a given button variant. */
export function getButtonVariantStyle(
  variant: ButtonVariant | string = "default",
): CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 84%, var(--sn-color-background, #ffffff))",
        color: "var(--sn-color-foreground, #111827)",
        border:
          "1px solid color-mix(in oklch, var(--sn-color-border, #e5e7eb) 88%, var(--sn-color-background, #ffffff))",
      };
    case "outline":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-background, #ffffff) 92%, transparent)",
        color: "var(--sn-color-foreground, #111827)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--sn-color-foreground, #111827)",
        border: "none",
      };
    case "destructive":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-destructive, #dc2626) 88%, var(--sn-color-background, #ffffff))",
        color: "var(--sn-color-destructive-foreground, #fff)",
        border: "none",
      };
    case "link":
      return {
        backgroundColor: "transparent",
        color: "var(--sn-color-primary, #2563eb)",
        border: "none",
        textDecoration: "underline",
        padding: "0",
      };
    default:
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-primary, #2563eb) 84%, var(--sn-color-background, #ffffff))",
        color: "var(--sn-color-primary-foreground, #fff)",
        border:
          "1px solid color-mix(in oklch, var(--sn-color-primary, #2563eb) 14%, var(--sn-color-background, #ffffff))",
      };
  }
}

/** Returns inline styles for a given button size. */
export function getButtonSizeStyle(
  size: ButtonSize | string = "sm",
): CSSProperties {
  switch (size) {
    case "md":
      return {
        padding: "var(--sn-spacing-xs, 0.5rem) var(--sn-spacing-md, 1rem)",
        fontSize: "var(--sn-font-size-md, 1rem)",
      };
    case "lg":
      return {
        padding: "var(--sn-spacing-sm, 0.75rem) var(--sn-spacing-lg, 1.5rem)",
        fontSize: "var(--sn-font-size-lg, 1.125rem)",
      };
    case "icon":
      return {
        padding: "var(--sn-spacing-xs, 0.5rem)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        width: "2.5rem",
        height: "2.5rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      };
    default:
      // sm
      return {
        padding: "var(--sn-spacing-2xs, 0.25rem) var(--sn-spacing-sm, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
      };
  }
}

/**
 * Returns the full set of base inline styles for a button.
 * Combines variant + size + shared properties (radius, font, cursor, disabled).
 */
export function getButtonStyle(
  variant: ButtonVariant | string = "default",
  size: ButtonSize | string = "sm",
  disabled?: boolean,
): CSSProperties {
  return {
    ...getButtonVariantStyle(variant),
    ...getButtonSizeStyle(size),
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled
      ? ("var(--sn-opacity-disabled, 0.5)" as unknown as number)
      : undefined,
    borderRadius: "var(--sn-radius-md, 0.375rem)",
    fontFamily: "var(--sn-font-sans, inherit)",
    fontWeight: "var(--sn-button-weight, var(--sn-font-weight-medium, 500))" as unknown as CSSProperties["fontWeight"],
    textTransform: "var(--sn-button-transform, none)" as unknown as CSSProperties["textTransform"],
    lineHeight: "var(--sn-leading-tight, 1.25)",
  };
}

/**
 * CSS rules for hover/focus on `[data-sn-button]` elements.
 * Components should include this in a `<style>` tag (deduplicated by attribute selector).
 */
export const BUTTON_INTERACTIVE_CSS = `
[data-sn-button]:not(:disabled) {
  transition: background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
}
[data-sn-button][data-variant="default"]:not(:disabled):hover {
  background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 88%, var(--sn-color-background, #ffffff)) !important;
  box-shadow: 0 1px 2px color-mix(in oklch, var(--sn-color-foreground, #111827) 12%, transparent);
}
[data-sn-button][data-variant="secondary"]:not(:disabled):hover {
  background-color: color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 92%, var(--sn-color-background, #ffffff)) !important;
  border-color: color-mix(in oklch, var(--sn-color-border, #e5e7eb) 100%, var(--sn-color-background, #ffffff)) !important;
}
[data-sn-button][data-variant="outline"]:not(:disabled):hover,
[data-sn-button][data-variant="ghost"]:not(:disabled):hover {
  background-color: var(--sn-color-accent, #f3f4f6) !important;
}
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-open="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-current="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-selected="true"] {
  background-color: color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent) !important;
  color: var(--sn-color-foreground, #111827) !important;
}
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-current="true"] {
  font-weight: var(--sn-font-weight-semibold, 600) !important;
}
[data-sn-button][data-variant="link"]:not(:disabled):hover {
  opacity: var(--sn-opacity-hover, 0.8) !important;
}
[data-sn-button][data-variant="destructive"]:not(:disabled):hover {
  background-color: color-mix(in oklch, var(--sn-color-destructive, #dc2626) 92%, var(--sn-color-background, #ffffff)) !important;
}
[data-sn-button]:focus { outline: none; }
[data-sn-button]:focus-visible {
  outline: var(--sn-ring-width, 2px) solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
`;
