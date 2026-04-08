import { useState, useEffect, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import type { SwitchConfig } from "./types";

/** Track and thumb dimensions for each size. */
const SIZE_MAP = {
  sm: { trackW: 32, trackH: 18, thumb: 14 },
  md: { trackW: 44, trackH: 24, thumb: 20 },
  lg: { trackW: 56, trackH: 30, thumb: 26 },
} as const;

/**
 * Switch component — a toggle switch for boolean values.
 *
 * Manages its own checked state internally, publishes via id,
 * and executes an action on toggle.
 *
 * @param props - Component props containing the switch configuration
 *
 * @example
 * ```json
 * {
 *   "type": "switch",
 *   "id": "notifications-toggle",
 *   "label": "Enable notifications",
 *   "description": "Receive email alerts",
 *   "color": "success",
 *   "action": { "type": "api", "method": "POST", "endpoint": "/api/settings", "body": {} }
 * }
 * ```
 */
export function Switch({ config }: { config: SwitchConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const color = config.color ?? "primary";
  const size = config.size ?? "md";
  const dims = SIZE_MAP[size];

  const [checked, setChecked] = useState(config.defaultChecked ?? false);

  // Publish value when checked changes
  useEffect(() => {
    if (publish) {
      publish({ checked });
    }
  }, [publish, checked]);

  const handleToggle = useCallback(() => {
    if (resolvedDisabled) return;
    const newValue = !checked;
    setChecked(newValue);
    if (config.action) {
      void execute(config.action);
    }
  }, [checked, resolvedDisabled, config.action, execute]);

  if (visible === false) return null;

  const thumbOffset = 2;
  const thumbTranslate = checked
    ? dims.trackW - dims.thumb - thumbOffset * 2
    : 0;

  return (
    <div
      data-snapshot-component="switch"
      data-testid="switch"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        opacity: resolvedDisabled
          ? "var(--sn-opacity-disabled, 0.5)"
          : undefined,
        cursor: resolvedDisabled ? "not-allowed" : "pointer",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      role="switch"
      aria-checked={checked}
      aria-disabled={resolvedDisabled}
      aria-label={resolvedLabel}
      tabIndex={resolvedDisabled ? -1 : 0}
    >
      <style>{`
        [data-snapshot-component="switch"]:focus { outline: none; }
        [data-snapshot-component="switch"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
          border-radius: var(--sn-radius-full, 9999px);
        }
      `}</style>

      {/* Track */}
      <div
        style={{
          position: "relative",
          width: dims.trackW,
          height: dims.trackH,
          borderRadius: "var(--sn-radius-full, 9999px)",
          backgroundColor: checked
            ? `var(--sn-color-${color}, #2563eb)`
            : "var(--sn-color-secondary, #e5e7eb)",
          transition:
            "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            top: thumbOffset,
            left: thumbOffset,
            width: dims.thumb,
            height: dims.thumb,
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxShadow: "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.2))",
            transform: `translateX(${thumbTranslate}px)`,
            transition:
              "transform var(--sn-duration-fast, 150ms) var(--sn-ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))",
          }}
        />
      </div>

      {/* Label + description */}
      {(resolvedLabel || config.description) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {resolvedLabel && (
            <span
              style={{
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-foreground, #111827)",
                fontWeight: 500,
              }}
            >
              {resolvedLabel}
            </span>
          )}
          {config.description && (
            <span
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              {config.description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
