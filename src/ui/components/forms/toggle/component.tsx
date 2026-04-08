import { useState, useEffect, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { ToggleConfig } from "./types";

/** Padding and icon size dimensions for each size variant. */
const SIZE_MAP = {
  sm: { padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)", iconSize: 14, fontSize: "var(--sn-font-size-xs, 0.75rem)" },
  md: { padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)", iconSize: 16, fontSize: "var(--sn-font-size-sm, 0.875rem)" },
  lg: { padding: "var(--sn-spacing-md, 0.75rem) var(--sn-spacing-lg, 1rem)", iconSize: 20, fontSize: "var(--sn-font-size-md, 1rem)" },
} as const;

/**
 * Config-driven Toggle component — a pressed/unpressed toggle button.
 *
 * When pressed, displays with primary background and foreground colors.
 * When unpressed, uses transparent background. Publishes `{ pressed: boolean }`
 * to the page context when an `id` is set.
 *
 * @param props - Component props containing the toggle config
 *
 * @example
 * ```json
 * {
 *   "type": "toggle",
 *   "id": "italic-toggle",
 *   "icon": "italic",
 *   "variant": "outline",
 *   "size": "sm",
 *   "changeAction": { "type": "set-value", "target": "editor", "field": "italic" }
 * }
 * ```
 */
export function Toggle({ config }: { config: ToggleConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  // Resolve from-refs
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const resolvedPressed = useSubscribe(config.pressed ?? false) as boolean;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const variant = config.variant ?? "default";
  const size = config.size ?? "md";
  const dims = SIZE_MAP[size];

  const [pressed, setPressed] = useState(resolvedPressed);

  // Sync external pressed state changes
  useEffect(() => {
    setPressed(resolvedPressed);
  }, [resolvedPressed]);

  // Publish pressed state
  useEffect(() => {
    if (publish) {
      publish({ pressed });
    }
  }, [publish, pressed]);

  const handleToggle = useCallback(() => {
    if (resolvedDisabled) return;
    const newPressed = !pressed;
    setPressed(newPressed);
    if (config.changeAction) {
      void execute(config.changeAction, { pressed: newPressed });
    }
  }, [pressed, resolvedDisabled, config.changeAction, execute]);

  const isOutline = variant === "outline";

  return (
    <button
      data-snapshot-component="toggle"
      data-testid="toggle"
      type="button"
      className={config.className}
      aria-pressed={pressed}
      aria-disabled={resolvedDisabled}
      disabled={resolvedDisabled}
      onClick={handleToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: config.label && config.icon ? "var(--sn-spacing-xs, 0.25rem)" : undefined,
        padding: dims.padding,
        fontSize: dims.fontSize,
        fontWeight: "var(--sn-font-weight-medium, 500)" as unknown as number,
        lineHeight: 1,
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        border: isOutline
          ? `var(--sn-border-default, 1px) solid ${
              pressed
                ? "var(--sn-color-primary, #2563eb)"
                : "var(--sn-color-border, #d1d5db)"
            }`
          : "var(--sn-border-default, 1px) solid transparent",
        backgroundColor: pressed
          ? "var(--sn-color-primary, #2563eb)"
          : isOutline
            ? "transparent"
            : "var(--sn-color-secondary, #f3f4f6)",
        color: pressed
          ? "var(--sn-color-primary-foreground, #ffffff)"
          : "var(--sn-color-foreground, #111827)",
        cursor: resolvedDisabled ? "not-allowed" : "pointer",
        opacity: resolvedDisabled
          ? "var(--sn-opacity-disabled, 0.5)"
          : undefined,
        transition: `background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
        userSelect: "none",
      }}
    >
      {config.icon && <Icon name={config.icon} size={dims.iconSize} />}
      {config.label && <span>{config.label}</span>}
    </button>
  );
}
