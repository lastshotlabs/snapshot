import { useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import type { SaveIndicatorConfig } from "./types";

/** CSS keyframes for the saving spinner animation (injected once). */
const SPINNER_KEYFRAMES = `
@keyframes sn-save-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

let styleInjected = false;

/** Inject the spinner keyframes into the document head (once). */
function ensureStyles(): void {
  if (styleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = SPINNER_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * SaveIndicator component — a config-driven inline status indicator
 * showing idle, saving, saved, or error states.
 *
 * - idle: nothing rendered
 * - saving: spinning loader icon + saving text
 * - saved: check icon + saved text (success color)
 * - error: alert-circle icon + error text (destructive color)
 *
 * @param props - Component props containing the save indicator configuration
 *
 * @example
 * ```json
 * {
 *   "type": "save-indicator",
 *   "status": "saved",
 *   "savedText": "All changes saved"
 * }
 * ```
 */
export function SaveIndicator({ config }: { config: SaveIndicatorConfig }) {
  const status = useSubscribe(config.status) as string;
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) return null;
  if (status === "idle") return null;

  ensureStyles();

  const showIcon = config.showIcon ?? true;
  const savingText = config.savingText ?? "Saving...";
  const savedText = config.savedText ?? "Saved";
  const errorText = config.errorText ?? "Error saving";

  let icon: string | null = null;
  let text = "";
  let color = "";
  let iconStyle: React.CSSProperties = {};

  switch (status) {
    case "saving":
      icon = "loader";
      text = savingText;
      color = "var(--sn-color-muted-foreground, #6b7280)";
      iconStyle = {
        animation: "sn-save-spin var(--sn-duration-slow, 1s) linear infinite",
        display: "flex",
      };
      break;
    case "saved":
      icon = "check";
      text = savedText;
      color = "var(--sn-color-success, #22c55e)";
      iconStyle = { display: "flex" };
      break;
    case "error":
      icon = "alert-circle";
      text = errorText;
      color = "var(--sn-color-destructive, #ef4444)";
      iconStyle = { display: "flex" };
      break;
    default:
      return null;
  }

  return (
    <span
      data-snapshot-component="save-indicator"
      data-testid="save-indicator"
      data-status={status}
      className={config.className}
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color,
        ...(config.style as React.CSSProperties),
      }}
    >
      {showIcon && icon && (
        <span aria-hidden="true" style={iconStyle}>
          <Icon name={icon} size={14} />
        </span>
      )}
      <span data-testid="save-indicator-text">{text}</span>
    </span>
  );
}
