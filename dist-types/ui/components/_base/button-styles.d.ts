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
export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
/** Supported button size names. */
export type ButtonSize = "sm" | "md" | "lg" | "icon";
/** Returns inline styles for a given button variant. */
export declare function getButtonVariantStyle(variant?: ButtonVariant | string): CSSProperties;
/** Returns inline styles for a given button size. */
export declare function getButtonSizeStyle(size?: ButtonSize | string): CSSProperties;
/**
 * Returns the full set of base inline styles for a button.
 * Combines variant + size + shared properties (radius, font, cursor, disabled).
 */
export declare function getButtonStyle(variant?: ButtonVariant | string, size?: ButtonSize | string, disabled?: boolean): CSSProperties;
/**
 * CSS rules for hover/focus on `[data-sn-button]` elements.
 * Components should include this in a `<style>` tag (deduplicated by attribute selector).
 */
export declare const BUTTON_INTERACTIVE_CSS = "\n[data-sn-button]:not(:disabled) {\n  transition: background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),\n              color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),\n              border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),\n              box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),\n              opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),\n              transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);\n}\n[data-sn-button][data-variant=\"default\"]:not(:disabled):hover {\n  background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 88%, var(--sn-color-background, #ffffff)) !important;\n  box-shadow: 0 1px 2px color-mix(in oklch, var(--sn-color-foreground, #111827) 12%, transparent);\n}\n[data-sn-button][data-variant=\"secondary\"]:not(:disabled):hover {\n  background-color: color-mix(in oklch, var(--sn-color-secondary, #f1f5f9) 92%, var(--sn-color-background, #ffffff)) !important;\n  border-color: color-mix(in oklch, var(--sn-color-border, #e5e7eb) 100%, var(--sn-color-background, #ffffff)) !important;\n}\n[data-sn-button][data-variant=\"outline\"]:not(:disabled):hover,\n[data-sn-button][data-variant=\"ghost\"]:not(:disabled):hover {\n  background-color: var(--sn-color-accent, #f3f4f6) !important;\n}\n[data-sn-button][data-variant=\"ghost\"]:not(:disabled)[data-open=\"true\"],\n[data-sn-button][data-variant=\"ghost\"]:not(:disabled)[data-current=\"true\"],\n[data-sn-button][data-variant=\"ghost\"]:not(:disabled)[data-selected=\"true\"] {\n  background-color: color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent) !important;\n  color: var(--sn-color-foreground, #111827) !important;\n}\n[data-sn-button][data-variant=\"ghost\"]:not(:disabled)[data-current=\"true\"] {\n  font-weight: var(--sn-font-weight-semibold, 600) !important;\n}\n[data-sn-button][data-variant=\"link\"]:not(:disabled):hover {\n  opacity: var(--sn-opacity-hover, 0.8) !important;\n}\n[data-sn-button][data-variant=\"destructive\"]:not(:disabled):hover {\n  background-color: color-mix(in oklch, var(--sn-color-destructive, #dc2626) 92%, var(--sn-color-background, #ffffff)) !important;\n}\n[data-sn-button]:focus { outline: none; }\n[data-sn-button]:focus-visible {\n  outline: var(--sn-ring-width, 2px) solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));\n  outline-offset: var(--sn-ring-offset, 2px);\n}\n";
