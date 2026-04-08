import { useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { AlertConfig } from "./types";

/** Default icon names per variant. */
const DEFAULT_ICONS: Record<string, string> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  destructive: "alert-circle",
};

/** Map variant to its semantic color token name. */
function variantColor(variant: string): string {
  switch (variant) {
    case "info":
      return "info";
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "destructive":
      return "destructive";
    default:
      return "border";
  }
}

/**
 * Alert component — a config-driven notification banner with icon, title,
 * description, and optional action button.
 *
 * Supports info, success, warning, destructive, and default variants.
 * Internally manages dismissed state.
 *
 * @param props - Component props containing the alert configuration
 *
 * @example
 * ```json
 * {
 *   "type": "alert",
 *   "title": "Heads up!",
 *   "description": "This action cannot be undone.",
 *   "variant": "warning",
 *   "dismissible": true
 * }
 * ```
 */
export function Alert({ config }: { config: AlertConfig }) {
  const resolvedTitle = useSubscribe(config.title ?? "") as string;
  const resolvedDescription = useSubscribe(config.description) as string;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [dismissed, setDismissed] = useState(false);

  if (visible === false || dismissed) return null;

  const variant = config.variant ?? "default";
  const colorToken = variantColor(variant);
  const icon = config.icon ?? DEFAULT_ICONS[variant] ?? null;
  const dismissible = config.dismissible ?? false;

  const handleAction = config.action
    ? () => void execute(config.action!)
    : undefined;

  return (
    <div
      data-snapshot-component="alert"
      data-testid="alert"
      data-variant={variant}
      className={config.className}
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-md, 0.75rem) var(--sn-spacing-lg, 1.5rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderLeft: `4px solid var(--sn-color-${colorToken}, #e5e7eb)`,
        backgroundColor: "var(--sn-color-card, #ffffff)",
        position: "relative",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Icon */}
      {icon && (
        <span
          data-testid="alert-icon"
          aria-hidden="true"
          style={{
            color: `var(--sn-color-${colorToken === "border" ? "muted-foreground" : colorToken})`,
            flexShrink: 0,
            marginTop: "var(--sn-spacing-2xs, 2px)",
            display: "flex",
          }}
        >
          <Icon name={icon} size={18} />
        </span>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {resolvedTitle && (
          <div
            data-testid="alert-title"
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
              color: "var(--sn-color-foreground, #111827)",
              marginBottom: "var(--sn-spacing-xs, 0.25rem)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {resolvedTitle}
          </div>
        )}
        <div
          data-testid="alert-description"
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            lineHeight: "var(--sn-leading-normal, 1.5)",
          }}
        >
          {resolvedDescription}
        </div>

        {/* Action button */}
        {handleAction && config.actionLabel && (
          <button
            type="button"
            data-testid="alert-action"
            onClick={handleAction}
            style={{
              marginTop: "var(--sn-spacing-sm, 0.5rem)",
              padding:
                "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
              color: `var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
              backgroundColor: "transparent",
              border: `var(--sn-border-default, 1px) solid var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              cursor: "pointer",
            }}
          >
            {config.actionLabel}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          data-testid="alert-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--sn-spacing-xs, 0.25rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-md, 1rem)",
            lineHeight: "var(--sn-leading-none, 1)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
          }}
        >
          <Icon name="x" size={16} />
        </button>
      )}
      <style>{`
        [data-snapshot-component="alert"] button:hover {
          background: var(--sn-color-accent, var(--sn-color-muted));
        }
        [data-snapshot-component="alert"] button:focus {
          outline: none;
        }
        [data-snapshot-component="alert"] button:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
    </div>
  );
}
