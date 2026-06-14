import type { CSSProperties } from "react";

/**
 * Shared button variant + size styles for Snapshot UI components.
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
          "color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 90%, var(--sn-color-background, #ffffff))",
        backgroundImage:
          "linear-gradient(180deg, color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 96%, var(--sn-color-background, #ffffff)), color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 86%, var(--sn-color-background, #ffffff)))",
        color: "var(--sn-color-foreground, #111827)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor:
          "color-mix(in oklch, var(--sn-color-border, #e5e7eb) 92%, var(--sn-color-background, #ffffff))",
        boxShadow:
          "inset 0 1px 0 color-mix(in oklch, #fff 64%, transparent), 0 1px 2px color-mix(in oklch, var(--sn-color-foreground, #111827) 6%, transparent)",
      };
    case "outline":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-background, #ffffff) 94%, transparent)",
        color: "var(--sn-color-foreground, #111827)",
        borderWidth: "var(--sn-border-default, 1px)",
        borderStyle: "solid",
        borderColor: "var(--sn-color-border, #e5e7eb)",
        boxShadow:
          "0 1px 2px color-mix(in oklch, var(--sn-color-foreground, #111827) 4%, transparent)",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--sn-color-foreground, #111827)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "transparent",
      };
    case "destructive":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-destructive, #dc2626) 88%, var(--sn-color-foreground, #111827))",
        backgroundImage:
          "linear-gradient(180deg, color-mix(in oklch, var(--sn-color-destructive, #dc2626) 94%, var(--sn-color-background, #ffffff)), color-mix(in oklch, var(--sn-color-destructive, #dc2626) 86%, var(--sn-color-foreground, #111827)))",
        color: "var(--sn-color-destructive-foreground, #fff)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor:
          "color-mix(in oklch, var(--sn-color-destructive, #dc2626) 72%, var(--sn-color-background, #ffffff))",
        boxShadow:
          "inset 0 1px 0 color-mix(in oklch, #fff 12%, transparent), 0 1px 2px color-mix(in oklch, var(--sn-color-destructive, #dc2626) 18%, transparent)",
      };
    case "link":
      return {
        backgroundColor: "transparent",
        color: "var(--sn-color-primary, #2563eb)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "transparent",
        textDecoration: "underline",
        textUnderlineOffset: "0.18em",
        padding: "0",
      };
    default:
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-primary, #2563eb) 88%, var(--sn-color-foreground, #111827))",
        backgroundImage:
          "linear-gradient(180deg, color-mix(in oklch, var(--sn-color-primary, #2563eb) 92%, var(--sn-color-background, #ffffff)), color-mix(in oklch, var(--sn-color-primary, #2563eb) 86%, var(--sn-color-foreground, #111827)))",
        color: "var(--sn-color-primary-foreground, #fff)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor:
          "color-mix(in oklch, var(--sn-color-primary, #2563eb) 72%, var(--sn-color-background, #ffffff))",
        boxShadow:
          "inset 0 1px 0 color-mix(in oklch, #fff 16%, transparent), 0 1px 2px color-mix(in oklch, var(--sn-color-primary, #2563eb) 18%, transparent)",
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
        padding: "0",
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
    boxSizing: "border-box",
    borderRadius: "var(--sn-radius-md, 0.375rem)",
    fontFamily: "var(--sn-font-sans, inherit)",
    fontWeight: "var(--sn-button-weight, var(--sn-font-weight-medium, 500))" as unknown as CSSProperties["fontWeight"],
    textTransform: "var(--sn-button-transform, inherit)" as unknown as CSSProperties["textTransform"],
    lineHeight: "var(--sn-leading-tight, 1.25)",
    textDecorationThickness: "from-font",
    userSelect: "none",
    verticalAlign: "middle",
  };
}

/**
 * CSS rules for hover/focus on `[data-sn-button]` elements.
 * Components should include this in a `<style>` tag (deduplicated by attribute selector).
 */
export const BUTTON_INTERACTIVE_CSS = `
[data-sn-button] {
  -webkit-tap-highlight-color: transparent;
}
[data-sn-button]:disabled,
[data-sn-button][aria-disabled="true"],
[data-sn-button][data-disabled="true"] {
  cursor: not-allowed !important;
}
[data-sn-button]:not(:disabled):not([aria-disabled="true"]) {
  transition: background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              background var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
}
[data-sn-button][data-variant="default"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="default"][data-hover="true"] {
  background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 90%, var(--sn-color-foreground, #111827)) !important;
  background-image: linear-gradient(180deg, color-mix(in oklch, var(--sn-color-primary, #2563eb) 96%, var(--sn-color-background, #ffffff)), color-mix(in oklch, var(--sn-color-primary, #2563eb) 90%, var(--sn-color-foreground, #111827))) !important;
  box-shadow: inset 0 1px 0 color-mix(in oklch, #fff 18%, transparent), 0 4px 10px color-mix(in oklch, var(--sn-color-primary, #2563eb) 18%, transparent) !important;
  transform: translateY(-1px);
}
[data-sn-button][data-variant="secondary"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="secondary"][data-hover="true"] {
  background-color: var(--sn-color-secondary, #f1f5f9) !important;
  background-image: linear-gradient(180deg, var(--sn-color-secondary, #f1f5f9), color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 90%, var(--sn-color-foreground, #111827))) !important;
  border-color: color-mix(in oklch, var(--sn-color-border, #e5e7eb) 100%, var(--sn-color-background, #ffffff)) !important;
}
[data-sn-button][data-variant="outline"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="outline"][data-hover="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="ghost"][data-hover="true"] {
  background-color: var(--sn-color-accent, #f3f4f6) !important;
  background-image: none !important;
  color: var(--sn-color-accent-foreground, var(--sn-color-foreground, #111827)) !important;
}
[data-sn-button][data-variant="link"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="link"][data-hover="true"] {
  color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 84%, var(--sn-color-foreground, #111827)) !important;
  text-decoration-thickness: 0.11em !important;
}
[data-sn-button][data-variant="destructive"]:not(:disabled):not([aria-disabled="true"]):hover,
[data-sn-button][data-variant="destructive"][data-hover="true"] {
  background-color: color-mix(in oklch, var(--sn-color-destructive, #dc2626) 92%, var(--sn-color-foreground, #111827)) !important;
  background-image: linear-gradient(180deg, color-mix(in oklch, var(--sn-color-destructive, #dc2626) 98%, var(--sn-color-background, #ffffff)), color-mix(in oklch, var(--sn-color-destructive, #dc2626) 90%, var(--sn-color-foreground, #111827))) !important;
  box-shadow: inset 0 1px 0 color-mix(in oklch, #fff 14%, transparent), 0 4px 10px color-mix(in oklch, var(--sn-color-destructive, #dc2626) 18%, transparent) !important;
  transform: translateY(-1px);
}
[data-sn-button][data-variant="outline"]:not(:disabled):is([data-open="true"], [data-selected="true"], [data-current="true"], [data-active="true"], [aria-pressed="true"], [aria-selected="true"]),
[data-sn-button][data-variant="secondary"]:not(:disabled):is([data-open="true"], [data-selected="true"], [data-current="true"], [data-active="true"], [aria-pressed="true"], [aria-selected="true"]) {
  background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, var(--sn-color-background, #ffffff)) !important;
  background-image: none !important;
  border-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 32%, var(--sn-color-border, #e5e7eb)) !important;
  color: var(--sn-color-primary, #2563eb) !important;
}
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-open="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-selected="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-active="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[aria-pressed="true"],
[data-sn-button][data-variant="ghost"]:not(:disabled)[aria-selected="true"] {
  background-color: color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent) !important;
  background-image: none !important;
  color: var(--sn-color-foreground, #111827) !important;
}
[data-sn-button][data-variant="ghost"]:not(:disabled)[data-current="true"] {
  background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent) !important;
  background-image: none !important;
  color: var(--sn-color-primary, #2563eb) !important;
  font-weight: var(--sn-font-weight-semibold, 600) !important;
}
[data-sn-button][data-invalid="true"],
[data-sn-button][aria-invalid="true"] {
  border-color: color-mix(in oklch, var(--sn-color-destructive, #dc2626) 72%, var(--sn-color-border, #e5e7eb)) !important;
}
[data-sn-button]:not(:disabled):not([aria-disabled="true"]):active {
  transform: translateY(0) scale(0.985) !important;
}
[data-sn-button]:focus { outline: none; }
[data-sn-button]:focus-visible,
[data-sn-button][data-focus="true"] {
  outline: var(--sn-ring-width, 2px) solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
  box-shadow: 0 0 0 4px color-mix(in oklch, var(--sn-color-primary, #2563eb) 16%, transparent) !important;
}
`;
